import type { Route } from "./+types/portfolio";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Portfolio | Magdalena Lazarczyk" }];
}

export default function Portfolio() {
  return (
    <main className="min-h-svh bg-white px-8 pb-8 pt-28 text-[#111]">
      <h1 className="mt-[120px] text-[clamp(48px,12vw,160px)] font-extrabold leading-[0.9]">
        Portfolio
      </h1>
    </main>
  );
}
