import fs from "fs";
import path from "path";

// DATA_DIR can be pointed at a persistent disk in production (e.g. /var/data/data on Render).
// Falls back to the repo's ./data folder for local development.
const REPO_DATA_DIR = path.join(process.cwd(), "data");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : REPO_DATA_DIR;

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
