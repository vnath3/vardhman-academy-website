export const googleTagUrl = 'https://www.googletagmanager.com/gtag/js?id=G-4F7P27EQSF';

// Keep automated visits out of the real Analytics property.
export async function stubAnalytics(page) {
  await page.route(googleTagUrl, route => route.fulfill({ contentType: 'text/javascript', body: '/* Google tag stub for local verification */' }));
}
