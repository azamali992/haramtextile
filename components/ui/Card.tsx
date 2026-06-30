import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export interface ProductCardData {
  id: string;
  name: string;
  fabricType?: string | null;
  moq?: string | null;
  categoryName: string;
  image: { src: string; width: number; height: number };
}

interface ProductCardProps {
  product: ProductCardData;
}

/** Full-bleed image card for the products grid. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-md bg-cream-off transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-dark">
        <Image
          src={product.image.src}
          alt={`${product.name}, ${product.categoryName} apparel by Haram Textile`}
          width={product.image.width}
          height={product.image.height}
          className="h-full w-full object-cover transition-transform duration-200 [@media(hover:hover)]:group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg text-brown-deep">{product.name}</h3>
        {product.fabricType && (
          <p className="mt-2 text-sm text-gray-warm">{product.fabricType}</p>
        )}
        {product.moq && (
          <Badge variant="moq" className="mt-4">
            MOQ: {product.moq}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export interface CertificationCardData {
  id: string;
  name: string;
  issuingBody?: string | null;
  description?: string | null;
  image: { src: string; width: number; height: number };
}

interface CertificationCardProps {
  certification: CertificationCardData;
}

/** Cream card with dark-cream border for the certifications grid — no box-shadow per design spec. */
export function CertificationCard({ certification }: CertificationCardProps) {
  return (
    <Link
      href={`/certifications/${certification.id}`}
      className="block rounded-md border border-cream-dark bg-cream p-6 transition-[transform,border-color,background-color,color] hover:border-gold-muted active:scale-[0.98]"
    >
      <div className="relative h-20 w-full">
        <Image
          src={certification.image.src}
          alt={`${certification.name} certification badge`}
          width={certification.image.width}
          height={certification.image.height}
          className="h-20 w-auto object-contain"
        />
      </div>
      <h3 className="mt-4 font-heading text-lg text-brown-deep">{certification.name}</h3>
      {certification.issuingBody && (
        <p className="mt-2 text-sm font-medium text-brown-deep">{certification.issuingBody}</p>
      )}
      {certification.description && (
        <p className="mt-4 text-sm text-gray-warm">{certification.description}</p>
      )}
    </Link>
  );
}
