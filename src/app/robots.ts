import type { MetadataRoute } from 'next';

/** Roteiro pessoal: fora dos buscadores (RF-14.1). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
