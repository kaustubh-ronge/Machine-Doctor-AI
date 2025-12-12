import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define which routes must be protected
// This checks for any route starting with /dashboard (e.g. /dashboard/scan, /dashboard/report/123)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/pricing(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user tries to access a protected route, enforce authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};