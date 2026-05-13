import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

type AnimatedPageContainerProps = {
  animate?: boolean;
  animationKey: string;
  children: ReactNode;
  className?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  onEntered?: () => void;
  ready?: boolean;
  style?: CSSProperties;
};

export function AnimatedPageContainer({
  animate = true,
  animationKey,
  children,
  className = "",
  containerRef,
  onEntered,
  ready = true,
  style,
}: AnimatedPageContainerProps) {
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    if (!ready) return;

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsVisible(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [animate, animationKey, ready]);

  const animationClass = animate
    ? isVisible
      ? "page-container-enter"
      : "translate-y-[112%]"
    : "";

  return (
    <div
      ref={containerRef}
      className={`${className} ${animationClass}`}
      style={style}
      onAnimationEnd={(event) => {
        if (event.animationName === "page-container-enter") {
          onEntered?.();
        }
      }}
    >
      {children}
    </div>
  );
}
