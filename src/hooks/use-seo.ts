import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_SEO: Required<SEOProps> = {
  title: 'CantaBarba Studio - La idea es tuya, nosotros hacemos la magia',
  description: 'CantaBarba Studio - Barbería profesional en CDMX. Cortes modernos, afeitado clásico, tratamientos de barba y mucho más. Reserva tu cita.',
  keywords: 'barbería, corte cabello, afeitado, barba, CDMX, México, CantaBarba Studio, barbero profesional, corte moderno, tratamiento barba',
  image: '/src/assets/logo1.jpg',
  url: 'https://cantabarba-studio.com',
  type: 'business',
  author: 'CantaBarba Studio',
  publishedTime: new Date().toISOString(),
  modifiedTime: new Date().toISOString()
};

export const useSEO = (seoProps: SEOProps = {}) => {
  const seo = { ...DEFAULT_SEO, ...seoProps };

  useEffect(() => {
    // Actualizar title
    document.title = seo.title;

    // Función para actualizar o crear meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, name);
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Meta tags básicos
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords);
    updateMetaTag('author', seo.author);

    // Open Graph tags
    updateMetaTag('og:title', seo.title, true);
    updateMetaTag('og:description', seo.description, true);
    updateMetaTag('og:image', seo.image, true);
    updateMetaTag('og:url', seo.url, true);
    updateMetaTag('og:type', seo.type, true);
    updateMetaTag('og:site_name', 'CantaBarba Studio', true);
    updateMetaTag('og:locale', 'es_MX', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seo.title);
    updateMetaTag('twitter:description', seo.description);
    updateMetaTag('twitter:image', seo.image);

    // Article specific tags (if type is article)
    if (seo.type === 'article') {
      updateMetaTag('article:published_time', seo.publishedTime, true);
      updateMetaTag('article:modified_time', seo.modifiedTime, true);
      updateMetaTag('article:author', seo.author, true);
    }

    // Business specific tags
    if (seo.type === 'business') {
      updateMetaTag('business:contact_data:street_address', 'Colonia Roma Norte, CDMX', true);
      updateMetaTag('business:contact_data:locality', 'Ciudad de México', true);
      updateMetaTag('business:contact_data:region', 'CDMX', true);
      updateMetaTag('business:contact_data:country_name', 'México', true);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', seo.url);

  }, [seo]);

  return seo;
};

// Hook para generar JSON-LD structured data
export const useStructuredData = (type: 'LocalBusiness' | 'Service' | 'Person' = 'LocalBusiness') => {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...(type === 'LocalBusiness' && {
        name: 'CantaBarba Studio',
        description: 'Barbería profesional especializada en cortes modernos, afeitado clásico y tratamientos de barba en Ciudad de México.',
        url: 'https://cantabarba-studio.com',
        telephone: '+52-55-1234-5678',
        email: 'contacto@cantabarba-studio.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Colonia Roma Norte',
          addressLocality: 'Ciudad de México',
          addressRegion: 'CDMX',
          postalCode: '06700',
          addressCountry: 'MX'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '19.4126',
          longitude: '-99.1332'
        },
        openingHours: [
          'Mo-Fr 09:00-20:00',
          'Sa 09:00-18:00',
          'Su 10:00-16:00'
        ],
        priceRange: '$$',
  image: '/src/assets/logo1.jpg',
  logo: '/src/assets/logo1.jpg',
        sameAs: [
          'https://www.instagram.com/cantabarba_studio',
          'https://www.facebook.com/cantabarba.studio'
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Servicios de Barbería',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Corte Clásico',
                description: 'Corte de cabello tradicional con técnicas clásicas'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Afeitado Premium',
                description: 'Afeitado tradicional con navaja y productos premium'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Corte Moderno',
                description: 'Cortes contemporáneos siguiendo las últimas tendencias'
              }
            }
          ]
        }
      })
    };

    // Remover script anterior si existe
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    // Agregar nuevo structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, [type]);
};

// Páginas específicas con SEO optimizado
export const HOME_SEO: SEOProps = {
  title: 'CantaBarba Studio - Barbería Profesional en CDMX | La idea es tuya, nosotros hacemos la magia',
  description: '🏆 La mejor barbería de Ciudad de México. Cortes modernos, afeitado clásico, tratamientos de barba premium. Reserva tu cita online. ✂️ Expertos con más de 10 años de experiencia.',
  keywords: 'barbería CDMX, corte cabello México, afeitado navaja, barbero profesional, corte moderno, tratamiento barba, CantaBarba Studio, barbería Roma Norte',
  type: 'business'
};

export const SERVICES_SEO: SEOProps = {
  title: 'Servicios de Barbería Premium | CantaBarba Studio CDMX',
  description: 'Descubre nuestros servicios premium: Corte Clásico, Afeitado Tradicional, Corte Moderno, Diseños Capilares y más. Calidad garantizada con productos de primera.',
  keywords: 'servicios barbería, corte clásico, afeitado premium, diseños capilares, tratamiento barba, barbería profesional CDMX'
};

export const BOOKING_SEO: SEOProps = {
  title: 'Reserva tu Cita Online | CantaBarba Studio',
  description: 'Reserva tu cita de barbería online de forma rápida y sencilla. Selecciona tu barbero, servicio y horario preferido. Confirmación inmediata por WhatsApp.',
  keywords: 'reservar cita barbería, agendar corte cabello, barbería online, cita barbero CDMX'
};

export const CONTACT_SEO: SEOProps = {
  title: 'Contacto y Ubicación | CantaBarba Studio Roma Norte CDMX',
  description: 'Visítanos en Roma Norte, CDMX. Horarios, teléfono, dirección y formas de contacto. Te esperamos para brindarte la mejor experiencia de barbería.',
  keywords: 'contacto barbería, dirección CantaBarba, Roma Norte barbería, teléfono barbería CDMX'
};