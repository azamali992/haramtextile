import Link from "next/link";
import { buildBreadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export interface BreadcrumbItem {
  name: string;
  /** Absolute URL for JSON-LD; the visual trail links relative to site root. */
  url: string;
  /** Relative path used for the visible `<Link>`, e.g. "/products". Omit for the current (last) page. */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/** Visual breadcrumb trail that also injects a `BreadcrumbList` JSON-LD script. */
export function Breadcrumb({ items }: BreadcrumbProps) {
  const schema = buildBreadcrumbSchema(items.map(({ name, url }) => ({ name, url })));

  return (
    <nav aria-label="Breadcrumb" className="px-4 py-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-warm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.href ? (
                <span className="text-brown-deep" aria-current={isLast ? "page" : undefined}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-green-primary">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={schema} />
    </nav>
  );
}
