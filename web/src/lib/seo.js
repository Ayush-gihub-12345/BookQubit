// src/lib/seo.js
export function generatePageMetadata({
  title,
  description,
  path,
  language = 'en',
  type = 'website',
  image = '/images/default-og.jpg',
  alternateLanguages = {},
  publishedTime,
  modifiedTime,
  tags = [],
}) {
  const baseUrl = 'https://www.bookqubit.com';
  const url = `${baseUrl}${path}`;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'en': `${baseUrl}/en${path}`,
        'es': `${baseUrl}/es${path}`,
        'fr': `${baseUrl}/fr${path}`,
        'de': `${baseUrl}/de${path}`,
        'ja': `${baseUrl}/ja${path}`,
        'zh': `${baseUrl}/zh${path}`,
        'hi': `${baseUrl}/hi${path}`,
        'ar': `${baseUrl}/ar${path}`,
        'ur': `${baseUrl}/ur${path}`,
        'bn': `${baseUrl}/bn${path}`,
        'pt': `${baseUrl}/pt${path}`,
        'ru': `${baseUrl}/ru${path}`,
        'it': `${baseUrl}/it${path}`,
        'ko': `${baseUrl}/ko${path}`,
        'nl': `${baseUrl}/nl${path}`,
        'tr': `${baseUrl}/tr${path}`,
        'vi': `${baseUrl}/vi${path}`,
        'th': `${baseUrl}/th${path}`,
        'pl': `${baseUrl}/pl${path}`,
        'sv': `${baseUrl}/sv${path}`,
        ...alternateLanguages,
      },
      'x-default': `${baseUrl}/en${path}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'BookQubit',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: language,
      type: type === 'article' ? 'article' : 'website',
      publishedTime,
      modifiedTime,
      tags: tags.join(', '),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      site: '@bookqubit',
      creator: '@bookqubit',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: tags.concat([
      'book collections',
      'book lists',
      'reading lists',
      'curated books',
      'BookQubit collections',
    ]).join(', '),
    authors: [{ name: 'BookQubit', url: 'https://www.bookqubit.com/about' }],
    category: 'books',
  };
}

// For article pages
export function generateArticleMetadata({
  title,
  description,
  path,
  language,
  image,
  publishedTime,
  modifiedTime,
  author,
  tags,
}) {
  return generatePageMetadata({
    title,
    description,
    path,
    language,
    type: 'article',
    image,
    publishedTime,
    modifiedTime,
    tags,
    alternateLanguages: {},
  });
}

// For category pages
export function generateCategoryMetadata({
  categoryName,
  language,
  bookCount,
}) {
  const titles = {
    en: `${categoryName} Books - Book Collections`,
    es: `Libros de ${categoryName} - Colecciones de Libros`,
    fr: `Livres ${categoryName} - Collections de Livres`,
    hi: `${categoryName} पुस्तकें - पुस्तक संग्रह`,
  };
  
  const descriptions = {
    en: `Explore our collection of ${categoryName} books. Find the best ${categoryName} books, new releases, and recommended reads.`,
    es: `Explore nuestra colección de libros de ${categoryName}. Encuentre los mejores libros de ${categoryName}, nuevos lanzamientos y lecturas recomendadas.`,
    fr: `Explorez notre collection de livres ${categoryName}. Trouvez les meilleurs livres ${categoryName}, les nouvelles sorties et les lectures recommandées.`,
    hi: `${categoryName} पुस्तकों का हमारा संग्रह देखें। सर्वश्रेष्ठ ${categoryName} पुस्तकें, नए रिलीज़ और अनुशंसित पाठन खोजें।`,
  };
  
  return generatePageMetadata({
    title: titles[language] || titles.en,
    description: descriptions[language] || descriptions.en,
    path: `/category/${categoryName.toLowerCase()}`,
    language,
    type: 'website',
    image: `/images/categories/${categoryName.toLowerCase()}-og.jpg`,
    tags: [categoryName, 'books', 'reading', 'BookQubit'],
  });
}