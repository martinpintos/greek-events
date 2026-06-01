// Serialize structured data for a <script type="application/ld+json"> tag.
// JSON.stringify does not escape "<", so a value containing "</script>" could
// otherwise break out of the tag. Escaping "<" closes that injection vector.
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
