import { useEffect, useRef, useState } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  useOutlet,
} from "react-router";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  usePresenceData,
  useReducedMotion,
} from "framer-motion";

import { PageHeader } from "./components/page-header";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.ico` },
  {
    rel: "icon",
    type: "image/png",
    sizes: "256x256",
    href: `${import.meta.env.BASE_URL}favicon.png`,
  },
  {
    rel: "apple-touch-icon",
    href: `${import.meta.env.BASE_URL}favicon.png`,
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Parisienne&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function RouteScreen({ children }: { children: React.ReactNode }) {
  const isPresent = useIsPresent();
  const presenceData = usePresenceData() as { delayExit?: boolean } | undefined;
  const shouldReduceMotion = useReducedMotion();
  const exitDelay = presenceData?.delayExit ? 0.52 : 0;

  return (
    <motion.div
      className="route-screen"
      initial={false}
      animate={{ y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { y: "100%" }}
      transition={{
        duration: shouldReduceMotion ? 0.18 : 0.72,
        ease: [0.76, 0, 0.24, 1],
        delay: exitDelay,
      }}
      style={{ zIndex: isPresent ? 1 : 2 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const navigation = useNavigation();
  const outlet = useOutlet();
  const previousPathname = useRef(location.pathname);
  const [chromePath, setChromePath] = useState(() =>
    location.pathname === "/" ? null : location.pathname,
  );
  const isRouteChanging = previousPathname.current !== location.pathname;
  const isNavigationPending = navigation.state !== "idle";
  const showSharedChrome = location.pathname !== "/";
  const delayPageExitForChrome =
    previousPathname.current !== "/" && isRouteChanging;

  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      setChromePath(null);
    }

    previousPathname.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="route-stage">
      <AnimatePresence mode="wait">
        {chromePath ? <PageHeader key={`shared-chrome-${chromePath}`} /> : null}
      </AnimatePresence>
      <AnimatePresence
        custom={{ delayExit: delayPageExitForChrome }}
        initial={false}
        onExitComplete={() => {
          setChromePath(showSharedChrome ? location.pathname : null);
        }}
      >
        <RouteScreen key={location.pathname}>{outlet}</RouteScreen>
      </AnimatePresence>
      {isNavigationPending ? (
        <div className="route-loading-indicator" role="status">
          <span className="portfolio-spinner" aria-hidden="true" />
          <span className="sr-only">Ładowanie</span>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
