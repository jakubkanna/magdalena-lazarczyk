import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/post";
import {
  fetchPortfolioPosts,
  loadPortfolioImageSrc,
  type PortfolioPostViewModel,
} from "../data/portfolio-api";

const mockWpParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur convallis libero at dui porta, sed viverra turpis vulputate. Donec fringilla ut mauris vitae sodales. Morbi faucibus diam blandit tortor condimentum, at euismod lectus finibus. Integer arcu erat, molestie vel ligula et, ultricies scelerisque lectus. Donec imperdiet, urna et luctus porta, libero tortor porttitor odio, at eleifend turpis ipsum eu enim. In accumsan tortor magna, a pellentesque leo aliquam at. Vivamus ac tincidunt eros, varius dignissim metus. Sed et purus et turpis finibus consectetur eu vel nisi. Aliquam vel orci porttitor, blandit est vel, interdum ante. Nulla dignissim lorem in urna dignissim mattis feugiat pellentesque dolor. Morbi vitae augue sed nisl interdum pellentesque. Vivamus elementum auctor metus.",
  "Phasellus nunc lectus, commodo eget molestie at, laoreet vel metus. Ut sit amet facilisis nulla. Vestibulum sagittis sagittis consectetur. Morbi arcu ipsum, varius ac quam in, pharetra lobortis mauris. Duis ante eros, pellentesque et dui id, posuere tincidunt diam. Quisque sed arcu suscipit, rhoncus diam a, facilisis arcu. Praesent pulvinar diam lectus, sed pretium ante pulvinar sed. Quisque vestibulum gravida dui, nec finibus nisi rutrum a. Pellentesque pretium augue nec elit suscipit vestibulum. Donec vehicula, ligula vel efficitur dapibus, diam metus efficitur erat, varius mollis felis massa in lorem. Suspendisse pellentesque dolor sollicitudin vestibulum volutpat. Nulla ac velit et nibh facilisis vestibulum eleifend eget est. Praesent ipsum lectus, luctus nec enim id, aliquam sollicitudin ligula.",
  "Nullam vel nibh nec tellus pellentesque semper. Vivamus mattis ullamcorper mauris in egestas. In at rutrum tellus, nec tincidunt nisl. Quisque ornare est a nisl fringilla, eu lacinia risus consectetur. Sed euismod nunc et laoreet maximus. Curabitur feugiat quam at augue efficitur tempor. Aenean molestie nulla in lacinia venenatis. Morbi commodo, dolor malesuada volutpat tincidunt, tortor nulla gravida sem, ac faucibus lectus metus sit amet quam. Suspendisse ac consequat arcu. Nullam pharetra posuere nisl et mollis. Pellentesque eros mi, maximus nec tortor et, sollicitudin vehicula turpis. Duis in enim vel elit euismod consectetur.",
  "Cras ante odio, ornare id augue sed, interdum semper dolor. Suspendisse pulvinar mauris velit, non ullamcorper dolor interdum ac. Morbi at neque ipsum. Duis egestas sem augue, at suscipit nunc pellentesque et. In hac habitasse platea dictumst. Nullam in aliquet neque. Nam consequat, elit sit amet accumsan tempor, risus leo fringilla metus, a pretium massa lectus quis arcu. Vivamus sed ipsum rutrum, consequat ipsum a, aliquet elit. Duis porta eros nec turpis scelerisque ullamcorper. Mauris diam ex, cursus id dolor laoreet, porta pharetra leo. Curabitur dignissim mi ut orci tincidunt tincidunt.",
  "Aenean tristique nisi luctus, aliquet turpis vitae, dictum nibh. Phasellus ut fringilla erat. Nunc nec ante at ligula euismod eleifend. Nunc ultrices suscipit mauris non euismod. Sed luctus nisl a suscipit dictum. Integer consequat rhoncus magna, sed viverra nisl placerat nec. Phasellus molestie ornare blandit. Donec sollicitudin metus nec eleifend pulvinar.",
  "Curabitur vel velit eu eros suscipit aliquet. Sed mollis, leo in tincidunt cursus, est neque finibus arcu, at imperdiet enim diam ac arcu. Integer hendrerit aliquet dolor ut tempor. Donec vel dapibus ipsum. Sed in mauris felis. Aliquam vitae dui posuere, viverra lorem rhoncus, euismod dolor. Quisque semper leo quis elementum vestibulum. Ut convallis eleifend nunc. Quisque non est est. Cras dignissim justo orci, et semper nunc mollis eu. Aenean convallis urna ut tristique bibendum. Donec at dictum erat.",
  "Nullam a luctus purus. Proin egestas justo non dolor commodo, at rhoncus augue gravida. Morbi volutpat finibus arcu, in consequat quam rutrum id. Nam sit amet eros ligula. Proin dui sem, consequat sit amet faucibus id, rutrum sed nisi. Interdum et malesuada fames ac ante ipsum primis in faucibus. Maecenas justo lectus, dictum nec felis id, blandit tempus felis. Nunc in luctus augue. Aenean nec feugiat mauris. Aliquam eu dui nisi. Aliquam laoreet est dolor, rutrum vulputate tortor convallis vitae. Phasellus et dolor vitae dui sagittis mattis vitae laoreet ipsum.",
];

const mockWpImageNames = [
  "20 2.webp",
  "43.webp",
  "56.webp",
  "40 1.webp",
  "18 1.webp",
  "61.webp",
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Post | Magdalena Łazarczyk" },
    {
      name: "description",
      content: "Szczegóły realizacji Magdaleny Łazarczyk.",
    },
  ];
}

function PostDetails({ post }: { post: PortfolioPostViewModel }) {
  return (
    <div className="font-display flex h-full flex-col justify-end self-stretch text-left text-[#222]">
      <p className="text-[clamp(18px,1.8vw,26px)] font-normal  italic leading-[1]">
        {post.venue}
      </p>
      <div className="mt-4 text-[clamp(15px,1.35vw,20px)] leading-[1.16]">
        <p>
          {post.place}, {post.year}
        </p>
        {post.credits.map((credit) => (
          <p key={credit}>{credit}</p>
        ))}
      </div>
    </div>
  );
}

function PostContent({
  post,
  imageSrcs,
}: {
  post: PortfolioPostViewModel;
  imageSrcs: string[];
}) {
  if (post.content) {
    return (
      <section className="post-content">
        <div
          className="post-content__text"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="post-content__media" aria-hidden="true" />
      </section>
    );
  }

  return (
    <section className="post-content">
      <div className="post-content__text">
        {mockWpParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="post-content__media">
        {imageSrcs.map((contentImageSrc) => (
          <figure className="wp-block-image" key={contentImageSrc}>
            <a
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
              href={contentImageSrc}
              target="_blank"
              rel="noreferrer"
              aria-label="Otwórz zdjęcie w nowej karcie"
            >
              <img
                src={contentImageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </a>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function Post() {
  const { postId } = useParams();
  const [post, setPost] = useState<PortfolioPostViewModel | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [contentImageSrcs, setContentImageSrcs] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const numericPostId = Number(postId);

    fetchPortfolioPosts().then(async (posts) => {
      const matchedPost = posts.find((portfolioPost) => {
        return portfolioPost.id === numericPostId;
      });
      const resolvedImageSrc = matchedPost
        ? await loadPortfolioImageSrc(matchedPost.image)
        : "";
      const contentImageOffset = Number.isFinite(numericPostId)
        ? numericPostId % mockWpImageNames.length
        : 0;
      const selectedContentImageNames = [
        mockWpImageNames[contentImageOffset],
        mockWpImageNames[(contentImageOffset + 3) % mockWpImageNames.length],
      ];
      const resolvedContentImageSrcs = await Promise.all(
        selectedContentImageNames.map((imageName) =>
          loadPortfolioImageSrc(imageName),
        ),
      );

      if (isMounted) {
        setPost(matchedPost ?? null);
        setImageSrc(resolvedImageSrc);
        setContentImageSrcs(resolvedContentImageSrcs.filter(Boolean));
        setHasLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (!hasLoaded) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-white text-[#111]">
        <span className="portfolio-spinner" aria-hidden="true" />
        <span className="sr-only">Ładowanie</span>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-svh bg-white px-4 pb-10 pt-28 text-[#111] md:px-8">
        <h1 className="font-display text-[96px] font-normal italic leading-[0.9]">
          Nie znaleziono
        </h1>
        <Link
          className="filter-button filter-button--large mt-10 inline-flex no-underline"
          to="/portfolio"
        >
          Portfolio
        </Link>
      </main>
    );
  }

  return (
    <main className="h-svh overflow-y-auto bg-white px-4 pb-10 pt-28 text-[#111] md:px-8">
      <article className="mx-auto grid max-w-[1600px] grid-cols-1 gap-y-12">
        <h1 className="font-display text-[clamp(44px,12vw,72px)] font-bold italic leading-[0.9] md:mt-[200px] md:text-[clamp(88px,14vw,160px)]">
          {post.title}
        </h1>

        <section className="my-[100px] grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {imageSrc ? (
            <a
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111]"
              href={imageSrc}
              target="_blank"
              rel="noreferrer"
              aria-label={`Otwórz zdjęcie ${post.title} w nowej karcie`}
            >
              <img
                className="block h-auto w-full"
                src={imageSrc}
                alt={post.title}
                decoding="async"
                draggable={false}
              />
            </a>
          ) : (
            <div
              className="portfolio-post-skeleton aspect-[4/3] w-full"
              aria-hidden="true"
            />
          )}
          <PostDetails post={post} />
        </section>

        <PostContent post={post} imageSrcs={contentImageSrcs} />

        <nav className="flex flex-wrap gap-4 pb-14" aria-label="Post links">
          <Link
            className="filter-button filter-button--large inline-flex no-underline"
            to="/portfolio"
          >
            Portfolio
          </Link>
          <Link
            className="filter-button filter-button--large inline-flex no-underline"
            to="/bio"
          >
            Bio
          </Link>
        </nav>
      </article>
    </main>
  );
}
