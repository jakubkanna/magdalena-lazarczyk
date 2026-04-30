import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
  useOutlet,
} from "react-router";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";

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
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="route-screen"
      initial={false}
      animate={{ y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { y: "100%" }}
      transition={{
        duration: shouldReduceMotion ? 0.18 : 0.72,
        ease: [0.76, 0, 0.24, 1],
      }}
      style={{ zIndex: isPresent ? 1 : 2 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="route-stage">
      <AnimatePresence initial={false}>
        <RouteScreen key={location.pathname}>
          {outlet}
        </RouteScreen>
      </AnimatePresence>
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
