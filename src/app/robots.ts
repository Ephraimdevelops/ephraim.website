import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/portal/'], // Disallow admin and portal routes
        },
        sitemap: 'https://ephraim.website/sitemap.xml', // Replace with actual domain
    };
}
