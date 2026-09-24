import fs from "fs";
import os from "os";
import path from "path";
import { KV_ENABLED, KVUnavailableError, cmd, pipeline } from "./kv";
import { PG_ENABLED, query, withClient } from "./db";

// DATA_DIR picks the file-store location: an explicit env var wins (a
// persistent disk in production, e.g. /var/data/data on Render; the isolated
// .e2e-data dir for tests). Without one, Vercel's bundle filesystem is
// read-only — every write there threw and 500ed login/contact — so fall back
// to os.tmpdir(): writable per instance, with instance-local lifetime (not
// durable storage; that's what the KV layer below is for). Local dev keeps
// ./data.
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : process.env.VERCEL
    ? path.join(os.tmpdir(), "portfolio-data")
    : REPO_DATA_DIR;

/** When running with an external DATA_DIR (fresh persistent disk), seed it from the repo's data folder. */
function seedIfMissing(name: string): boolean {
  if (DATA_DIR === REPO_DATA_DIR) return false;
  const src = path.join(REPO_DATA_DIR, name + ".json");
  const dest = path.join(DATA_DIR, name + ".json");
  try {
    if (!fs.existsSync(dest) && fs.existsSync(src)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.copyFileSync(src, dest);
      return true;
    }
  } catch {}
  return false;
}

export function readJSON<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name + ".json"), "utf8")) as T;
  } catch {
    if (seedIfMissing(name)) {
      try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name + ".json"), "utf8")) as T;
      } catch {}
    }
    return fallback;
  }
}

export function writeJSON(name: string, data: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, name + ".json");
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

export type Social = { label: string; url: string };
export type Stat = { label: string; value: number };
export type TimelineItem = { year: string; title: string; text: string };
export type Profile = {
  name: string; role: string; headline: string; tagline: string;
  about: string; aboutMore: string; email: string; phone?: string; location: string;
  resumeUrl: string; socials: Social[]; stats: Stat[]; timeline: TimelineItem[];
};
export type Settings = {
  accent: string; preloader: boolean; effects3d: boolean;
  availability: "open" | "booked"; availabilityText: string;
  metaTitle: string; metaDescription: string; siteUrl?: string;
};
export type Skill = { id: string; name: string; level: number; category: string };
export type Project = {
  id: string; slug: string; title: string; summary: string; description: string;
  stack: string[]; category: string; liveUrl: string; repoUrl: string;
  featured: boolean; order: number; year: string; cover?: string; embed?: boolean;
};
export type Service = { id: string; title: string; text: string };
export type ProcessStep = { step: string; title: string; text: string };
export type Testimonial = { id: string; name: string; role: string; rating: number; quote: string; published: boolean };
export type Message = { id: string; name: string; email: string; subject: string; message: string; date: string; read: boolean };
export type Post = {
  id: string; slug: string; title: string; excerpt: string; content: string;
  cover?: string; tags: string[]; published: boolean; date: string;
  metaTitle?: string; metaDescription?: string;
};

export type Content = {
  profile: Profile; settings: Settings; skills: Skill[]; projects: Project[];
  services: Service[]; process: ProcessStep[]; testimonials: Testimonial[];
  posts?: Post[];
};

export function getContent(): Content {
  return readJSON<Content>("content", {} as Content);
}

export function saveContent(c: Content) {
  writeJSON("content", c);
}

export function getMessages(): Message[] {
  return readJSON<Message[]>("messages", []);
}

export function saveMessages(m: Message[]) {
  writeJSON("messages", m);
}

// --- Durable message layer (KV_ENABLED = Upstash env present) ---------------
//
// Messages live in a Redis Hash keyed by message id: HSET to add (single
// atomic command — no read-modify-write), HDEL to delete one, HGETALL to
// read. The bundle's data/messages.json seeds an empty hash behind a SETNX
// guard so a fresh store starts with today's messages (zero-migration).
// Without Upstash env, every async function below falls back to the file
// path — local dev and the e2e suite are byte-identical to before.

const MSG_HASH = "portfolio:messages";
const SEED_KEY = "portfolio:seeded";

function parseMessage(raw: unknown): Message | null {
  try {
    const m = JSON.parse(String(raw)) as Message;
    if (m && typeof m === "object" && typeof m.id === "string" && typeof m.date === "string") return m;
  } catch {}
  return null;
}

/** Newest first (date desc); unparseable entries dropped defensively. */
export async function getMessagesAsync(): Promise<Message[]> {
  if (PG_ENABLED) {
    const r = await query<{ data: Message }>("select data from portfolio_messages order by date desc");
    return r.rows.map((row) => row.data).filter((m) => m && typeof m.id === "string");
  }
  if (!KV_ENABLED) return getMessages();
  const [seedLock, initial] = await pipeline(cmd.setnx(SEED_KEY, "1"), cmd.hgetall(MSG_HASH));
  let hash = initial as Record<string, string>;
  if (seedLock === 1) {
    // We won the seed race: copy the bundled inbox, then re-read — messages
    // may already exist in the hash (e.g. written before this first read),
    // and returning the seed alone would hide them.
    const seed = getMessages();
    if (seed.length) await pipeline(...seed.map((m) => cmd.hset(MSG_HASH, m.id, JSON.stringify(m))));
    const reread = await pipeline(cmd.hgetall(MSG_HASH));
    hash = reread[0] as Record<string, string>;
  }
  return Object.values(hash)
    .map(parseMessage)
    .filter((m): m is Message => m !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Throws KVUnavailableError when the durable store is down and configured — routes fail loud. */
export async function addMessage(m: Message): Promise<void> {
  if (PG_ENABLED) {
    await query(
      "insert into portfolio_messages (id, data, date) values ($1, $2, $3) on conflict (id) do update set data = excluded.data",
      [m.id, JSON.stringify(m), m.date],
    );
    return;
  }
  if (!KV_ENABLED) {
    const messages = getMessages();
    messages.unshift(m);
    saveMessages(messages);
    return;
  }
  await pipeline(cmd.hset(MSG_HASH, m.id, JSON.stringify(m)));
}

/** Full replace (admin PUT reads the array, edits, writes it back). */
export async function replaceMessages(m: Message[]): Promise<void> {
  if (PG_ENABLED) {
    // One transaction: upsert every incoming row, delete ids absent from it.
    await withClient(async (client) => {
      await client.query("begin");
      for (const x of m) {
        await client.query(
          "insert into portfolio_messages (id, data, date) values ($1, $2, $3) on conflict (id) do update set data = excluded.data",
          [x.id, JSON.stringify(x), x.date],
        );
      }
      await client.query("delete from portfolio_messages where id <> all($1::text[])", [m.map((x) => x.id)]);
      await client.query("commit");
    });
    return;
  }
  if (!KV_ENABLED) {
    saveMessages(m);
    return;
  }
  const [, hash] = await pipeline(cmd.setnx(SEED_KEY, "1"), cmd.hgetall(MSG_HASH));
  const keep = new Set(m.map((x) => x.id));
  const stale = Object.keys(hash as Record<string, string>).filter((id) => !keep.has(id));
  await pipeline(
    ...m.map((x) => cmd.hset(MSG_HASH, x.id, JSON.stringify(x))),
    ...stale.map((id) => cmd.hdel(MSG_HASH, id)),
  );
}
