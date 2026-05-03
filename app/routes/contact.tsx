import type { Route } from "./+types/contact";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Contact | Magdalena Lazarczyk" }];
}

export default function Contact() {
  return (
    <main className="min-h-svh bg-white px-8 pb-8 pt-28 text-[#111]">
      <h1 className="mt-[120px] text-[clamp(48px,12vw,160px)] font-extrabold leading-[0.9]">
        Contact
      </h1>
    </main>
  );
}
