import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { PortfolioPostViewModel } from "../data/portfolio-api";

type ProjectCardProps = {
  post: PortfolioPostViewModel;
  imageSrc?: string;
};

export function ProjectCard({ post, imageSrc }: ProjectCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const postPath = `/post/${post.slug}?from=${encodeURIComponent(post.category)}`;

  const waitForImage = (src: string) =>
    new Promise<void>((resolve) => {
      const image = new Image();
      if (image.decode) {
        image.onload = () => {
          image.decode().then(resolve).catch(resolve);
        };
      } else {
        image.onload = () => resolve();
      }
      image.onerror = () => resolve();
      image.src = src;
      if (image.complete) {
        if (image.decode) {
          image.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      }
    });

  const openPost = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    if (imageSrc) {
      await waitForImage(imageSrc);
    }

    navigate(postPath, {
      state: {
        post,
        imageSrc: imageSrc ?? "",
      },
    });
  };

  return (
    <Link
      to={postPath}
      className="group relative block overflow-hidden"
      onClick={(event) => void openPost(event)}
    >
      {imageSrc ? (
        <>
          <div className="absolute inset-0 animate-pulse bg-black/10" />
          <img
            src={imageSrc}
            alt={post.title}
            className="relative block aspect-[4/3] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <div className="w-fit max-w-[92%] translate-y-3 scale-90 rounded-2xl bg-white px-4 py-4 text-[#222] opacity-0 shadow-[10px_14px_34px_rgb(0_0_0_/_0.24)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.18,1.45,0.32,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100">
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
          {isNavigating ? (
            <div
              className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-white/35"
              role="status"
            >
              <span
                className="size-7 animate-spin rounded-full border-2 border-black/20 border-t-black"
                aria-hidden="true"
              />
              <span className="sr-only">Ładowanie</span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="aspect-[4/3] w-full animate-pulse bg-black/10" />
      )}
    </Link>
  );
}
