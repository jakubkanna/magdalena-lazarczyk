import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useOutlet,
} from "react-router";

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
  return <div className="absolute inset-0 min-h-svh w-full bg-white">{children}</div>;
}

export default function App() {
  const navigation = useNavigation();
  const outlet = useOutlet();
  const isNavigationPending = navigation.state !== "idle";

  return (
    <div className="relative min-h-svh w-screen overflow-hidden bg-white">
      <RouteScreen>{outlet}</RouteScreen>
      {isNavigationPending ? (
        <div
          className="pointer-events-none fixed inset-0 z-[1500] flex items-center justify-center"
          role="status"
        >
          <span
            className="h-7 w-7 animate-spin rounded-full border-2 border-black/20 border-t-black"
            aria-hidden="true"
          />
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
