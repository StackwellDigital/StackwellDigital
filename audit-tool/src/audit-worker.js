/**
 * Website Audit Worker
 * Handles server-side website audits for Stackwell Digital
 * Deployment: wrangler deploy
 */

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const { url } = await request.json();

      if (!url) {
        return new Response(
          JSON.stringify({ error: 'Missing URL parameter' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate URL
      let urlObj;
      try {
        urlObj = new URL(url);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid URL format' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the page
      const startTime = Date.now();
      const fetchResponse = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const loadTime = Date.now() - startTime;

      if (!fetchResponse.ok) {
        return new Response(
          JSON.stringify({ 
            error: `Failed to fetch page (${fetchResponse.status})`,
            details: fetchResponse.statusText 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const html = await fetchResponse.text();

      // Parse HTML
      const checks = parseAndAudit(html, urlObj.toString());
      checks.loadTime = loadTime;
      checks.status = fetchResponse.status;

      // Return results
      return new Response(JSON.stringify({ success: true, checks }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Audit error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Audit failed',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  },
};

/**
 * Parse HTML and run audit checks
 */
function parseAndAudit(html, url) {
  const checks = {
    https: false,
    title: false,
    metaDescription: false,
    h1: false,
    viewport: false,
    favicon: false,
    contentLength: 0,
    hasImages: false,
    hasLinks: false,
    lang: false,
  };

  try {
    // Check HTTPS
    checks.https = url.startsWith('https://');

    // Parse HTML (simple string matching since we can't use DOM parser in Worker)
    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    checks.title = titleMatch ? titleMatch[1].trim().length > 0 : false;
    checks.titleText = titleMatch ? titleMatch[1].trim() : null;

    // Meta description
    const metaMatch = html.match(/<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']/i);
    checks.metaDescription = !!metaMatch;
    checks.metaDescriptionText = metaMatch ? metaMatch[1] : null;

    // H1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    checks.h1 = !!h1Match;
    checks.h1Text = h1Match ? h1Match[1].trim() : null;

    // Viewport
    const viewportMatch = html.match(/<meta\s+name=["\']viewport["\']/i);
    checks.viewport = !!viewportMatch;

    // Favicon
    const faviconMatch = html.match(/<link[^>]*rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\']/i);
    checks.favicon = !!faviconMatch;

    // Lang attribute
    const langMatch = html.match(/<html[^>]*lang=["\']?([a-z]{2})/i);
    checks.lang = !!langMatch;
    checks.langCode = langMatch ? langMatch[1] : null;

    // Content stats
    checks.contentLength = html.length;
    checks.hasImages = /<img\s/i.test(html);
    checks.hasLinks = /<a\s+href/i.test(html);

    // Count headings
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    checks.headingStructure = { h1: h1Match ? 1 : 0, h2: h2Count, h3: h3Count };

    // Check for canonical
    const canonicalMatch = html.match(/<link[^>]*rel=["\']canonical["'][^>]*href=["\']([^"\']+)["\']/i);
    checks.canonical = !!canonicalMatch;

    // Open Graph
    const ogTitleMatch = html.match(/<meta\s+property=["\']og:title["'][^>]*content=["\']([^"\']+)["\']/i);
    checks.openGraph = !!ogTitleMatch;

    // Twitter Card
    const twitterMatch = html.match(/<meta\s+name=["\']twitter:card["\']/i);
    checks.twitterCard = !!twitterMatch;

    // SSL check (from URL)
    checks.ssl = checks.https;

  } catch (error) {
    console.error('Parse error:', error);
  }

  return checks;
}
