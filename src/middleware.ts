import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const allowedRegions = [
    'tn',  /* Tamil Nadu */
    'ka',  /* Karnataka */
    'mh',  /* Maharashtra */
    'dl',  /* Delhi */
    'ts',  /* Telangana */
    'hr',  /* Haryana */
    'se',   /* Singapore */
    'uaedxb', /* UAE Dubai */
    'uaesh', /* UAE Sharjah */
    'uaead' /* UAE Abu Dhabi */
];

const intlMiddleware = createIntlMiddleware(routing);

const keywordRedirectMap: Record<string, string> = {
    // 'calibration': 'https://home.acecms.in', 
  // 'acecms': 'https://home.acecms.in',
  // 'cms': 'https://home.acecms.in',
  // 'project': 'https://project.acesoftcloud.in',
  // 'crm': 'https://crm.acesoftcloud.in',
  'production-management-system': '/products/ace-production-management-system',
  'payroll': '/products/ace-profit-stand-alone-payroll',
  'ppap': '/products/ace-profit-ppap',
  'fixed-asset-management': '/products/ace-fixed-asset-management-on-cloud',
  'hrms': '/products/ace-profit-stand-alone-hrms',
  'erp': '/products/ace-profit-erp',
  'project': '/products/ace-project-management-software',
  'aceproject': '/products/ace-project-management-software',
  'acecms': '/products/ace-calibration-management-system',
};

const knownPaths = new Set([
  '/',
  '/products',
  '/request_callback',
  '/contact',
  '/about',
  '/admin',
  '/admin/upload',
  '/login',
  '/user',
  '/videos',
  '/web-development',
  '/products/ace-project-management-software',
  '/products/ace-calibration-management-system'
]);

function isSkippable(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  );
}

function getRedirectFromKeyword(pathname: string): string | null {
  for (const keyword in keywordRedirectMap) {
    if (pathname.toLowerCase().includes(keyword.toLowerCase())) {
      return keywordRedirectMap[keyword];
    }
  }
  return null;
}

function stripLocale(pathname: string): string {
  const localePattern = /^\/(en|hi|be|br|de|fr|es|it|ru|zh|ja|kr)(\/|$)/;
  return pathname.replace(localePattern, '/');
}

// Remove any region segment from the full path
function removeRegionFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];

  if (allowedRegions.includes(last)) {
    const newParts = parts.slice(0, -1);
    return '/' + newParts.join('/');
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('[middleware] Path:', pathname);

  const response = intlMiddleware(request);

  if (isSkippable(pathname)) {
    return response || NextResponse.next();
  }

  // Strip region from any part of the path
  const cleanedPath = removeRegionFromPath(pathname);
  if (cleanedPath !== null && cleanedPath !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = cleanedPath || '/';
    return NextResponse.redirect(url);
  }

  

  const redirectTo = getRedirectFromKeyword(pathname);
  if (redirectTo) {
    console.log(`[middleware] Keyword redirect → ${redirectTo}`);
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const basePath = stripLocale(pathname);
  if (knownPaths.has(basePath) || pathname.startsWith('/products/')|| pathname.startsWith('/admin/edit/')|| pathname.startsWith('/demo/')|| pathname.startsWith('/request_callback/'))
    {
    return response || NextResponse.next();
  }

  // Unknown path. Redirecting to /
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|.*\\..*).*)',
  ],
};