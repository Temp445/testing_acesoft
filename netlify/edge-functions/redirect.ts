export default async (request: Request) => {
  const url = new URL(request.url);
  let targetUrl;
  
  const supportedLanguages = ['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh', 'kr', 'pt', 'ru', 'be', 'br', 'it'];
  
  // Create regex pattern for language prefixes
  const langPattern = `(${supportedLanguages.join('|')})`;
  
  // Define route patterns with their corresponding target URLs
  const routePatterns = [
    {
      pattern: new RegExp(`^(\/${langPattern})?\/products\/ace-calibration-management-system-on-cloud`),
      targetBase: 'https://acecms.netlify.app'
    },
    {
      pattern: new RegExp(`^(\/${langPattern})?\/products\/ace-project-management-software`),
      targetBase: 'https://aceproject1.netlify.app'
    }
  ];
  
  // Find matching route
  const matchedRoute = routePatterns.find(route => route.pattern.test(url.pathname));
  
  if (matchedRoute) {
    // Remove language prefix
    const cleanPath = url.pathname.replace(new RegExp(`^\/${langPattern}`), '');
    targetUrl = `${matchedRoute.targetBase}${cleanPath}${url.search}`;
  } else {
    return new Response(`Not Found - No match for: ${url.pathname}`, { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  console.log('Making fetch request to:', targetUrl);
  
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    });
    
    return response;
  } catch (error) {
    // Handle unknown error type safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    
    return new Response(`Proxy error: ${errorMessage}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Generate paths for all supported languages
const generatePaths = () => {
  const supportedLanguages = ['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh', 'kr', 'pt', 'ru', 'be', 'br', 'it'];
  const basePaths = [
    '/products/ace-calibration-management-system-on-cloud',
    '/products/ace-calibration-management-system-on-cloud/*',
    '/products/ace-project-management-software',
    '/products/ace-project-management-software/*',
  ];
  
  const paths = [...basePaths];
  
  // Add paths with language prefixes
  supportedLanguages.forEach(lang => {
    basePaths.forEach(path => {
      paths.push(`/${lang}${path}`);
    });
  });
  
  return paths;
};

export const config = {
  path: generatePaths()
};