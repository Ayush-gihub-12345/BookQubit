export default {
  defaultTitle: "BookQubit – Discover Books, Read Previews & Smart Summaries Online",
  titleTemplate: "%s | BookQubit",
  description: "Discover books you'll love with BookQubit. Read previews, explore detailed summaries, and find your next great read with confidence.",
  canonical: "https://bookqubit.com",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookqubit.com',
    siteName: 'BookQubit',
    title: "BookQubit | Book Discovery, Previews, Details & Smart Summaries",
    description: "Discover your next favorite book with BookQubit. Explore detailed previews, in-depth book details, and concise summaries.",
    images: [
      {
        url: 'https://bookqubit.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BookQubit - Smart Reading Platform',
      },
    ],
  },
  twitter: {
    handle: '@bookqubit',
    site: '@bookqubit',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'books, book summaries, book previews, book discovery, reading app, BookQubit, ebooks, novels, online books',
    },
    {
      name: 'author',
      content: 'BookQubit',
    },
    {
      name: 'application-name',
      content: 'BookQubit',
    },
    {
      name: 'msapplication-TileColor',
      content: '#0ea5e9',
    },
    // ✅ Pinterest verification in next-seo config
    {
      name: 'p:domain_verify',
      content: '16cbeead871ab4c02072d92867663687',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicons/favicon.ico',
    },
    {
      rel: 'manifest',
      href: '/favicons/site.webmanifest',
    },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      title: 'BookQubit Feed',
      href: '/feed.xml',
    },
  ],
}