// middleware.js

import { NextResponse } from 'next/server';

const locales = ['en', 'hi', 'ur', 'ar', 'bn', 'es', 'fr', 'de', 'ja', 'zh'];
const defaultLocale = 'en';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // ============================================
  // Redirect /:lang/drift to /drift
  // ============================================
  for (const locale of locales) {
    if (pathname === `/${locale}/drift` || pathname.startsWith(`/${locale}/drift/`)) {
      const remainingPath = pathname.replace(`/${locale}/drift`, '');
      const newUrl = new URL(`/drift${remainingPath}`, request.url);
      return NextResponse.redirect(newUrl, { status: 301 });
    }
  }
  
  // ============================================
  // Allow /drift to work normally
  // ============================================
  if (pathname === '/drift' || pathname.startsWith('/drift/')) {
    return NextResponse.next();
  }
  
  // ============================================
  // Handle public routes with language
  // ============================================
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  const pathnameHasLocale = locales.some(
    locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  
  if (pathnameHasLocale) {
    const response = NextResponse.next();
    const lang = pathname.split('/')[1];
    response.cookies.set('NEXT_LOCALE', lang, { path: '/' });
    return response;
  }
  
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }
  
  let targetLocale = defaultLocale;
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLang && locales.includes(cookieLang)) {
    targetLocale = cookieLang;
  } else {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0]?.split('-')[0];
      if (locales.includes(preferredLocale)) {
        targetLocale = preferredLocale;
      }
    }
  }
  
  const newPath = `/${targetLocale}${pathname}`;
  return NextResponse.redirect(new URL(newPath, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};