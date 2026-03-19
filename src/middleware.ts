import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// By default, make all routes protected EXCEPT the auth routes if we have them. 
// However, clerkMiddleware handles sign-in out of the box. 
// Creating a route matcher to protect everything by default
const isPublicRoute = createRouteMatcher(['/api/webhook(.*)']); // webhook etc if needed

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
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
