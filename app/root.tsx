import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useNavigation,
  useOutlet,
} from "react-router";
import { useState } from "react";

import type { Route } from "./+types/root";
import { Sidebar } from "./components/sidebar";
import "./app.css";

const sections = ["Teatr", "Sztuka", "Warsztaty"] as const;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const categoryToSlug: Record<(typeof sections)[number], string> = {
  Warsztaty: "warsztaty",
  Teatr: "teatr",
  Sztuka: "sztuka",
};
const categoryColors: Record<(typeof sections)[number], string> = {
  Warsztaty: "#F2621C",
  Sztuka: "#D4FC85",
  Teatr: "#0011FF",
};

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;

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
  return (
    <div className="absolute inset-0 min-h-svh w-full bg-white">{children}</div>
  );
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
  const navigate = useNavigate();
  const [sidebarVariant, setSidebarVariant] = useState<
    "default" | "minimized"
  >(() => (isMobileViewport() ? "minimized" : "default"));
  let message = "Błąd";
  let details = "Wystąpił nieoczekiwany błąd.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Błąd";
    details =
      error.status === 404
        ? "Nie znaleziono żądanej strony."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      className="relative isolate h-svh min-h-svh w-screen overflow-hidden bg-[#e8dfd0]"
      aria-label="Błąd strony"
    >
      <div className="flex h-full min-h-0 w-screen max-md:flex-col">
        <Sidebar
          variant={sidebarVariant}
          activeCategory={null}
          hoveredCategory={null}
          categories={sections}
          categoryColors={categoryColors}
          showSpinner={false}
          onHomeClick={() => navigate("/")}
          onCategoryHover={() => undefined}
          onCategorySelect={(category) =>
            navigate(
              `/${categoryToSlug[category as (typeof sections)[number]]}`,
            )
          }
          onCollapse={() => setSidebarVariant("minimized")}
          onExpand={() => setSidebarVariant("default")}
        />

        <section className="relative z-[6] flex h-full min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#7eaed8] p-6 shadow-[-12px_0_18px_rgba(0,0,0,0.22)]">
          <div className="max-w-xl text-center text-black/75">
            <h1 className="m-0 text-8xl leading-none font-normal max-md:text-7xl">
              {message}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-tight">
              {details}
            </p>
            <button
              type="button"
              className="mt-8 cursor-pointer rounded-full bg-[#eee4d5] px-4 py-2 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:bg-[#e0d6c7] hover:text-black"
              onClick={() => navigate("/")}
            >
              Wróć na stronę główną
            </button>
            {stack ? (
              <pre className="mt-6 max-h-52 w-full overflow-auto rounded bg-white/40 p-4 text-left text-xs">
                <code>{stack}</code>
              </pre>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
