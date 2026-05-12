import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioPostViewModel } from "../data/portfolio-api";
import { ProjectCard } from "./project-card";

type CategoryGridProps = {
  posts: PortfolioPostViewModel[];
  imageSrcByPostId: Record<number, string>;
};

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";
const ROW_LOAD_DELAY_MS = 320;

function getColumns() {
  if (typeof window === "undefined") return 3;
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches ? 2 : 3;
}

export function CategoryGrid({ posts, imageSrcByPostId }: CategoryGridProps) {
  const [columns, setColumns] = useState(getColumns);
  const [visibleRows, setVisibleRows] = useState(3);
  const [isLoadingRow, setIsLoadingRow] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const postsKey = useMemo(
    () => posts.map((post) => post.id).join(","),
    [posts],
  );

  useEffect(() => {
    const onResize = () => setColumns(getColumns());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setVisibleRows(3);
    setIsLoadingRow(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [postsKey]);

  const visibleCount = Math.min(posts.length, visibleRows * columns);
  const visiblePosts = useMemo(
    () => posts.slice(0, visibleCount),
    [posts, visibleCount],
  );
  const remaining = posts.length - visibleCount;
  const hasMore = remaining > 0;
  const skeletonCount = isLoadingRow ? Math.min(columns, remaining) : 0;

  useEffect(() => {
    if (!hasMore || isLoadingRow) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        setIsLoadingRow(true);
        observer.disconnect();
        timerRef.current = window.setTimeout(() => {
          setVisibleRows((rows) => rows + 1);
          setIsLoadingRow(false);
          timerRef.current = null;
        }, ROW_LOAD_DELAY_MS);
      },
      { root: null, rootMargin: "250px 0px", threshold: 0.01 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingRow, visibleCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-1 max-md:grid-cols-2">
        {visiblePosts.map((post) => (
          <ProjectCard
            key={post.id}
            post={post}
            imageSrc={imageSrcByPostId[post.id]}
          />
        ))}
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={`skeleton-${visibleCount}-${index}`}
            className="aspect-[4/3] w-full animate-pulse bg-black/12"
            aria-hidden="true"
          />
        ))}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      ) : null}
    </div>
  );
}
