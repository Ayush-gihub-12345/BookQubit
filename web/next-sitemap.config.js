/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://bookqubit.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: '/dashboard/*' },
      { userAgent: '*', disallow: '/auth/*' },
    ],
    // Remove additionalSitemaps as they create a circular reference
    // The sitemap.xml is auto-generated, no need to reference itself
  },
  exclude: ['/dashboard/*', '/auth/*', '/server-sitemap.xml'], // Exclude server-sitemap if not needed
  generateIndexSitemap: true,
  
  // Add dynamic routes for your academic books
  additionalPaths: async (config) => {
    const path = require('path');
    
    // Import your academic books data
    const academicBooksPath = path.join(process.cwd(), 'src/data/academic_books_data/index.js');
    const { getAllBooks } = await import(academicBooksPath);
    
    // Get all books across all languages
    const allBooks = getAllBooks();
    
    // Generate unique sitemap entries for each book
    const bookPaths = allBooks.map((book) => ({
      loc: `/academicbooks/${book.slug}`,
      lastmod: book.updatedAt || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    }));
    
    // Add language-specific paths if needed
    const languagePaths = [
      { loc: '/academicbooks', priority: 0.9, changefreq: 'daily' },
      { loc: '/academicbooks?lang=en', priority: 0.8, changefreq: 'daily' },
      { loc: '/academicbooks?lang=hi', priority: 0.8, changefreq: 'daily' },
      { loc: '/academicbooks?lang=ta', priority: 0.8, changefreq: 'daily' },
      // Add other languages as needed
    ].map((route) => ({
      loc: route.loc,
      lastmod: new Date().toISOString(),
      changefreq: route.changefreq,
      priority: route.priority,
    }));
    
    return [...bookPaths, ...languagePaths];
  },
  
  // Transform function to customize each sitemap entry
  transform: async (config, path) => {
    // Custom priorities for different paths
    let priority = 0.5;
    let changefreq = 'monthly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/academicbooks') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.startsWith('/academicbooks/')) {
      priority = 0.7;
      changefreq = 'weekly';
    } else if (path.startsWith('/category/')) {
      priority = 0.6;
      changefreq = 'weekly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};