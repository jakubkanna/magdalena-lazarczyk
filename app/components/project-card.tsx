import { Link } from "react-router";
import type { PortfolioPostViewModel } from "../data/portfolio-api";

type ProjectCardProps = {
  post: PortfolioPostViewModel;
  imageSrc?: string;
};

export function ProjectCard({ post, imageSrc }: ProjectCardProps) {
  return (
    <Link
      to={`${import.meta.env.BASE_URL}post/${post.id}?from=${encodeURIComponent(post.category)}`}
      className="group relative block overflow-hidden"
    >
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={post.title}
            className="block aspect-[4/3] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <div className="w-[min(92%,520px)] translate-y-2 rounded-2xl bg-white px-4 py-4 text-[#222] shadow-[10px_14px_34px_rgb(0_0_0_/_0.24)] transition-transform duration-200 group-hover:translate-y-0 group-focus-visible:translate-y-0">
              <h2 className="text-base leading-tight italic">{post.title}</h2>
              <div className="mt-3 text-sm leading-[1.2]">
                <p>
                  {post.venue}, {post.place}, {post.year}
                </p>
                {post.credits.map((credit) => (
                  <p key={credit}>{credit}</p>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="aspect-[4/3] w-full animate-pulse bg-black/10" />
      )}
    </Link>
  );
}
