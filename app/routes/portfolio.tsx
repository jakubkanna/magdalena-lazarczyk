import { Link } from "react-router";
import type { Route } from "./+types/portfolio";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Portfolio | Magdalena Lazarczyk" }];
}

export default function Portfolio() {
  return (
    <main className="page">
      <Link className="page__back" to="/">
        Home
      </Link>
      <h1>Portfolio</h1>
    </main>
  );
}
