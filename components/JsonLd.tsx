/**
 * Renders a JSON-LD graph into a <script type="application/ld+json"> tag.
 * Server component. `<` is escaped to \u003c so an admin-authored string
 * containing "</script>" can never break out of the tag (JSON.stringify does
 * not escape forward slashes on its own).
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
