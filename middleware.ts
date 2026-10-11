import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/publisher(.*)",
  "/admin(.*)",
  "/account(.*)",
  "/saved(.*)",
  "/claim(.*)",
]);

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default hasClerkKey
  ? clerkMiddleware(async (auth, req) => {
      if (!isProtectedRoute(req)) return;

      const { userId, redirectToSignIn } = await auth();
      if (userId) return;

      if (typeof redirectToSignIn === "function") {
        return redirectToSignIn({ returnBackUrl: req.url });
      }

      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
