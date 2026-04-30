import { useEffect, useState } from "react";
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Magdalena Lazarczyk" },
    {
      name: "description",
      content: "Homepage collage for Magdalena Lazarczyk.",
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
    <img
      className="frontpage__frame"
      src={assetPath(frames[visibleFrameIndex])}
      alt=""
      draggable={false}
    />
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

export default function Home() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <main className="frontpage" aria-label="Magdalena Lazarczyk">
      {frontpageLayers.map((layer) =>
        layer.frames ? (
          <div
            key={layer.id}
            className={`frontpage__layer frontpage__frames${
              hoveredLayer === layer.id ? " frontpage__layer--hovered" : ""
            }`}
            aria-hidden="true"
            style={{
              zIndex: layer.zIndex,
              transform: layer.offsetX ? `translateX(${layer.offsetX}px)` : undefined,
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
          <motion.img
            key={layer.id}
            className={`frontpage__layer${
              hoveredLayer === layer.id ? " frontpage__layer--hovered" : ""
            }`}
            src={layer.src ? assetPath(layer.src) : undefined}
            alt=""
            aria-hidden="true"
            draggable={false}
            animate={layer.animate}
            transition={layer.transition}
            style={{
              zIndex: layer.zIndex,
              transformOrigin: layer.transformOrigin,
            }}
          />
        ),
      )}
      {frontpageLayers
        .filter((layer) => layer.hoverable && layer.hoverBox)
        .map((layer) => (
          <motion.div
            key={`${layer.id}-hover`}
            className="frontpage__hitbox"
            aria-label={layer.tooltip}
            animate={layer.animate}
            transition={layer.transition}
            onMouseEnter={() => setHoveredLayer(layer.id)}
            onMouseLeave={() => setHoveredLayer(null)}
            onClick={() => {
              if (layer.href) {
                navigate(layer.href);
              }
            }}
            onKeyDown={(event) => {
              if (layer.href && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                navigate(layer.href);
              }
            }}
            role={layer.href ? "link" : undefined}
            tabIndex={layer.href ? 0 : undefined}
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
          </motion.div>
        ))}
    </main>
  );
}
