/**
 * Shared cover-image element for every project/blog/media thumbnail.
 *
 * Deliberately presentational: it never touches process.env, so the SAME
 * component renders in server components (which resolve the Supabase webp +
 * srcset transform via lib/thumb) and in client components (which receive the
 * already-transformed src/srcSet as props). Consolidating here keeps the
 * optimization consistent across the site and centralizes the one <img> +
 * eslint-disable + async/lazy defaults instead of duplicating them per page.
 */
type CoverImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function CoverImage({ src, srcSet, sizes, alt, width, height, className }: CoverImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
