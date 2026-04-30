import { useEffect, useState } from "react";
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
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
  transformOrigin?: string;
  animate?: TargetAndTransition;
  transition?: Transition;
};

const catFrames = [
  "/frontpage/cat/cat_0000_cat---Rotate-Object-Layer-copy-3.png",
  "/frontpage/cat/cat_0001_cat---Rotate-Object-Layer-copy-2.png",
  "/frontpage/cat/cat_0002_cat---Rotate-Object-Layer-copy.png",
  "/frontpage/cat/cat_0003_cat---Rotate-Object-Layer.png",
  "/frontpage/cat/cat_0004_cat.png",
];

const catFrameDuration = 4;

const legsFrames = Array.from(
  { length: 9 },
  (_, index) =>
    `/frontpage/legs/mp_%20(1)_${(index + 31).toString().padStart(5, "0")}.png`,
);

const legsFramesPerSecond = 5;
const legsFrameDuration = (legsFrames.length * 2 - 2) / legsFramesPerSecond;

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
      src={frames[visibleFrameIndex]}
      alt=""
      draggable={false}
    />
  );
}

const frontpageLayers: FrontpageLayer[] = [
  {
    id: 6,
    zIndex: 70,
    src: "/frontpage/kolaz-magdalena-lazarczyk_0000s_0000_Background.png",
    transformOrigin: "83% 87%",
    animate: { scale: [1, 1.2, 1] },
    transition: {
      duration: 12,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
  {
    id: 5,
    zIndex: 45,
    src: "/frontpage/kolaz-magdalena-lazarczyk_0002s_0000_Layer-6.png",
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
    src: "/frontpage/kolaz-magdalena-lazarczyk_0003_3.png",
  },
  {
    id: 4,
    zIndex: 65,
    frames: legsFrames,
    frameDuration: legsFrameDuration,
    pingPongFrames: true,
    pingPongPause: 2,
  },
  {
    id: 2,
    zIndex: 60,
    src: "/frontpage/kolaz-magdalena-lazarczyk_0002_2.png",
  },
  {
    id: 1,
    zIndex: 70,
    src: "/frontpage/kolaz-magdalena-lazarczyk_0001_1.png",
  },
  {
    id: 0,
    zIndex: 70,
    frames: catFrames,
    frameDuration: catFrameDuration,
    offsetX: 25,
  },
];

export default function Home() {
  return (
    <main className="frontpage" aria-label="Magdalena Lazarczyk">
      {frontpageLayers.map((layer) =>
        layer.frames ? (
          <div
            key={layer.id}
            className="frontpage__layer frontpage__frames"
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
            className="frontpage__layer"
            src={layer.src}
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
    </main>
  );
}
