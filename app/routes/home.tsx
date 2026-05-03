import { useEffect, useState } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";
import { useNavigate } from "react-router";
import { MenuButton } from "../components/menu-button";
import { SiteMenu } from "../components/site-menu";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Magdalena Łazarczyk" },
    {
      name: "description",
      content:
        "Portfolio Magdaleny Łazarczyk - scenografia, kostiumy, teatr, sztuka i warsztaty.",
    },
    { property: "og:title", content: "Magdalena Łazarczyk" },
    {
      property: "og:description",
      content:
        "Portfolio Magdaleny Łazarczyk - scenografia, kostiumy, teatr, sztuka i warsztaty.",
    },
  ];
}

type FrontpageLayer = {
  id: number;
  zIndex: number;
  src?: string;
  frames?: string[];
  frameDuration?: number;
  reverseFrames?: boolean;
  pingPongFrames?: boolean;
  pingPongPause?: number;
  offsetX?: number;
  hoverable?: boolean;
  navigationDisabled?: boolean;
  tooltip?: string;
  href?: string;
  hoverBox?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  transformOrigin?: string;
  animate?: TargetAndTransition;
  transition?: Transition;
};

const catFrames = [
  "frontpage/cat/cat_0000_cat---Rotate-Object-Layer-copy-3.png",
  "frontpage/cat/cat_0001_cat---Rotate-Object-Layer-copy-2.png",
  "frontpage/cat/cat_0002_cat---Rotate-Object-Layer-copy.png",
  "frontpage/cat/cat_0003_cat---Rotate-Object-Layer.png",
  "frontpage/cat/cat_0004_cat.png",
];

const catFrameDuration = 6;
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const responsiveWidths = [1280, 1920, 2560] as const;
const originalWidth = 3840;
const frontpageImageSizes = "100vw";

const responsiveAssetPath = (path: string, width: number) => {
  const lastDotIndex = path.lastIndexOf(".");
  const extension = lastDotIndex > -1 ? path.slice(lastDotIndex) : "";
  const pathWithoutExtension =
    lastDotIndex > -1 ? path.slice(0, lastDotIndex) : path;
  const optimizedPath = pathWithoutExtension.replace(
    "frontpage/",
    "frontpage/optimized/",
  );

  return assetPath(`${optimizedPath}-${width}w${extension}`);
};

const imageSrcSet = (path: string) =>
  [
    ...responsiveWidths.map(
      (width) => `${responsiveAssetPath(path, width)} ${width}w`,
    ),
    `${assetPath(path)} ${originalWidth}w`,
  ].join(", ");

const getDisplayWidth = () => {
  if (typeof window === "undefined") {
    return originalWidth;
  }

  return Math.ceil(window.innerWidth * window.devicePixelRatio);
};

const getBestImagePath = (path: string) => {
  const displayWidth = getDisplayWidth();
  const matchedWidth = responsiveWidths.find((width) => width >= displayWidth);

  return matchedWidth
    ? responsiveAssetPath(path, matchedWidth)
    : assetPath(path);
};

const preloadImage = (path: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.decoding = "async";
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(finish).catch(finish);
        return;
      }

      finish();
    };
    image.onerror = finish;
    image.src = getBestImagePath(path);
  });

function FrameSequence({
  frames,
  duration,
  pingPong = false,
  pingPongPause = 0,
  reverse = false,
}: {
  frames: string[];
  duration: number;
  pingPong?: boolean;
  pingPongPause?: number;
  reverse?: boolean;
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const motionFrameCount = pingPong ? frames.length * 2 - 2 : frames.length;
  const intervalDuration = (duration * 1000) / motionFrameCount;
  const pauseFrameCount = pingPong
    ? Math.round((pingPongPause * 1000) / intervalDuration)
    : 0;
  const frameCount = motionFrameCount + pauseFrameCount;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((currentFrame) => (currentFrame + 1) % frameCount);
    }, intervalDuration);

    return () => window.clearInterval(interval);
  }, [frameCount, intervalDuration]);

  const pingPongFrameIndex =
    pingPong && frameIndex >= frames.length + pauseFrameCount
      ? motionFrameCount - (frameIndex - pauseFrameCount)
      : pingPong && frameIndex >= frames.length
        ? frames.length - 1
        : frameIndex;

  const visibleFrameIndex = reverse
    ? frames.length - 1 - pingPongFrameIndex
    : pingPongFrameIndex;

  return (
    <>
      {frames.map((frame, index) => (
        <img
          className={`frontpage__frame${
            index === visibleFrameIndex ? " frontpage__frame--visible" : ""
          }`}
          key={frame}
          src={assetPath(frame)}
          srcSet={imageSrcSet(frame)}
          sizes={frontpageImageSizes}
          alt=""
          draggable={false}
        />
      ))}
    </>
  );
}

const frontpageLayers: FrontpageLayer[] = [
  {
    id: 6,
    zIndex: 70,
    src: "frontpage/kolaz-magdalena-lazarczyk_0000s_0000_Background.png",
    transformOrigin: "83% 87%",
  },
  {
    id: 5,
    zIndex: 45,
    src: "frontpage/kolaz-magdalena-lazarczyk_0002s_0000_Layer-6.png",
    hoverable: true,
    navigationDisabled: true,
    tooltip: "Contact",
    href: "/contact",
    hoverBox: { left: 66.95, top: 35.46, width: 5.6, height: 41.44 },
    animate: { x: [0, 100, 0] },
    transition: {
      duration: 10,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
  {
    id: 3,
    zIndex: 40,
    src: "frontpage/kolaz-magdalena-lazarczyk_0003_3.png",
  },
  {
    id: 4,
    zIndex: 65,
    src: "frontpage/legs.png",
  },
  {
    id: 2,
    zIndex: 60,
    src: "frontpage/kolaz-magdalena-lazarczyk_0002_2.png",
  },
  {
    id: 1,
    zIndex: 70,
    src: "frontpage/curtain.png",
  },
  {
    id: 7,
    zIndex: 71,
    src: "frontpage/rock.png",
    hoverable: true,
    navigationDisabled: true,
    tooltip: "Bio",
    href: "/bio",
    hoverBox: { left: 25.62, top: 14.58, width: 18.28, height: 28.19 },
    transformOrigin: "34.76% 28.68%",
    animate: {
      x: [0, 0, -5, 5, -4, 4, -2, 2, 0, 0],
      rotate: [0, 0, -1.2, 1.2, -0.9, 0.9, -0.4, 0.4, 0, 0],
    },
    transition: {
      duration: 5,
      times: [0, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.9, 0.93, 1],
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
  {
    id: 0,
    zIndex: 70,
    frames: catFrames,
    frameDuration: catFrameDuration,
    offsetX: 25,
    hoverable: true,
    tooltip: "Portfolio",
    href: "/portfolio",
    hoverBox: { left: 43.12, top: 69.91, width: 12.73, height: 19.49 },
  },
];

const frontpageImagePaths = frontpageLayers.flatMap((layer) =>
  layer.frames ? layer.frames : layer.src ? [layer.src] : [],
);

const loaderText = "Magdalena Łazarczyk";
const minimumLoaderDuration = 2900;
const loaderExitDuration = 720;
let hasShownHomeLoader = false;

const layerAnimationClass = (layer: FrontpageLayer) =>
  layer.id === 5
    ? " frontpage__layer--contact-motion"
    : layer.id === 7
      ? " frontpage__layer--rock-motion"
      : "";

export default function Home() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(hasShownHomeLoader);
  const [isSceneRendered, setIsSceneRendered] = useState(hasShownHomeLoader);
  const [isLoaderVisible, setIsLoaderVisible] = useState(!hasShownHomeLoader);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasShownHomeLoader) {
      setIsLoaded(true);
      setIsSceneRendered(true);
      setIsLoaderVisible(false);
      return;
    }

    let isCancelled = false;
    const minimumDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, minimumLoaderDuration);
    });

    Promise.all([
      Promise.all(frontpageImagePaths.map(preloadImage)),
      minimumDelay,
    ]).then(() => {
      if (!isCancelled) {
        hasShownHomeLoader = true;
        setIsLoaded(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setIsSceneRendered(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isSceneRendered) {
      document.title = "Ładowanie...";
      return;
    }

    document.title = "Magdalena Łazarczyk";

    const loaderTimer = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, loaderExitDuration);

    return () => window.clearTimeout(loaderTimer);
  }, [isSceneRendered]);

  return (
    <main className="frontpage" aria-label="Magdalena Lazarczyk">
      {isLoaderVisible ? (
        <div
          className={`frontpage__loader${
            isSceneRendered ? " frontpage__loader--complete" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            id="logo"
            className="frontpage__loader-text"
            aria-label={loaderText}
          >
            {Array.from(loaderText).map((letter, index) => (
              <span
                className="frontpage__loader-letter"
                key={`${letter}-${index}`}
                aria-hidden="true"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {letter === " " ? "\u00a0" : letter}
              </span>
            ))}
          </span>
        </div>
      ) : null}
      <div
        className={`frontpage__scene${
          isLoaded ? " frontpage__scene--loaded" : ""
        }`}
        aria-hidden={!isSceneRendered}
      >
        {isLoaded
          ? frontpageLayers.map((layer) =>
              layer.frames ? (
                <div
                  key={layer.id}
                  className={`frontpage__layer frontpage__frames${
                    hoveredLayer === layer.id
                      ? " frontpage__layer--hovered"
                      : ""
                  }`}
                  aria-hidden="true"
                  style={{
                    zIndex: layer.zIndex,
                    transform: layer.offsetX
                      ? `translateX(${layer.offsetX}px)`
                      : undefined,
                  }}
                >
                  <FrameSequence
                    frames={layer.frames}
                    duration={layer.frameDuration ?? 2}
                    pingPong={layer.pingPongFrames}
                    pingPongPause={layer.pingPongPause}
                    reverse={layer.reverseFrames}
                  />
                </div>
              ) : (
                <img
                  key={layer.id}
                  className={`frontpage__layer${
                    hoveredLayer === layer.id
                      ? " frontpage__layer--hovered"
                      : ""
                  }${layerAnimationClass(layer)}`}
                  src={layer.src ? assetPath(layer.src) : undefined}
                  srcSet={layer.src ? imageSrcSet(layer.src) : undefined}
                  sizes={frontpageImageSizes}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  style={{
                    zIndex: layer.zIndex,
                    transformOrigin: layer.transformOrigin,
                  }}
                />
              ),
            )
          : null}
        {isLoaded
          ? frontpageLayers
              .filter((layer) => layer.hoverable && layer.hoverBox)
              .map((layer) => (
                <div
                  key={`${layer.id}-hover`}
                  className={`frontpage__hitbox${layerAnimationClass(layer)}`}
                  aria-label={layer.tooltip}
                  onMouseEnter={() => setHoveredLayer(layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => {
                    if (layer.href && !layer.navigationDisabled) {
                      navigate(layer.href);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      layer.href &&
                      !layer.navigationDisabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      navigate(layer.href);
                    }
                  }}
                  role={
                    layer.href && !layer.navigationDisabled
                      ? "link"
                      : undefined
                  }
                  tabIndex={
                    layer.href && !layer.navigationDisabled ? 0 : undefined
                  }
                  style={{
                    zIndex: layer.zIndex + 100,
                    left: `${layer.hoverBox?.left}%`,
                    top: `${layer.hoverBox?.top}%`,
                    width: `${layer.hoverBox?.width}%`,
                    height: `${layer.hoverBox?.height}%`,
                    transform: layer.offsetX
                      ? `translateX(${layer.offsetX}px)`
                      : undefined,
                    transformOrigin: layer.transformOrigin,
                  }}
                >
                  {layer.tooltip && hoveredLayer === layer.id ? (
                    <span className="frontpage__tooltip">{layer.tooltip}</span>
                  ) : null}
                </div>
              ))
          : null}
        <div className="frontpage__help">
          <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
        </div>
        <SiteMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
    </main>
  );
}
