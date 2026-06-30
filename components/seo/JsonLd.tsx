/**
 * Renders a schema.org JSON-LD `<script>` tag. Next 14's App Router has no
 * `next/head`, so structured data is rendered directly into the page tree.
 * Callers must pass already-sanitized data (see the `build*Schema` helpers
 * in `lib/seo.ts`, which all run their output through `sanitizeDeep`).
 */
export interface JsonLdProps {
  data: object;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- data is sanitized by lib/seo.ts build*Schema helpers
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
