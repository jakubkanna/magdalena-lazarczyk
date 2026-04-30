import { Link } from "react-router";
import type { Route } from "./+types/bio";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Bio | Magdalena Lazarczyk" }];
}

export default function Bio() {
  return (
    <main className="page">
      <Link className="page__back" to="/">
        Home
      </Link>
      <h1>Bio</h1>
    </main>
  );
}
