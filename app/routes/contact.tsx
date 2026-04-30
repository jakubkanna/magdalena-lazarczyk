import { Link } from "react-router";
import type { Route } from "./+types/contact";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Contact | Magdalena Lazarczyk" }];
}

export default function Contact() {
  return (
    <main className="page">
      <Link className="page__back" to="/">
        Home
      </Link>
      <h1>Contact</h1>
    </main>
  );
}
