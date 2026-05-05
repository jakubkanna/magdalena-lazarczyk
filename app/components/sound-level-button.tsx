import { useState } from "react";
import { useMusicConsent } from "./music-consent";

type SoundLevelButtonProps = {
  className?: string;
};

const youtubeMarqueeLabel =
  "Fantasy Realm Ambience and Music | fantasy music and nature sounds #fantasyambience";
const youtubeThumbnailUrl = "https://i.ytimg.com/vi/amwA16ye148/hqdefault.jpg";

export function SoundLevelButton({ className }: SoundLevelButtonProps) {
  const { consent, isMusicEnabled, toggleMusic, volume, setVolume } =
    useMusicConsent();
  const [hasHovered, setHasHovered] = useState(false);

  if (consent !== "yes") {
    return null;
  }

  return (
    <div
      className={`group relative flex items-center text-inherit${
        className ? ` ${className}` : ""
      }`}
    >
      {isMusicEnabled ? (
        <div className="pointer-events-none absolute right-full mr-3 flex h-8 items-center opacity-0 transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.currentTarget.value))}
            aria-label="Volume"
            className="pointer-events-auto h-1 w-24 appearance-none rounded-full bg-current/40 accent-current"
          />
        </div>
      ) : null}
      <div className="sound-level-tooltip">
        <img
          className="sound-level-tooltip__cover"
          src={youtubeThumbnailUrl}
          alt=""
          aria-hidden="true"
        />
        <div className="sound-level-tooltip__track">
          {[youtubeMarqueeLabel, youtubeMarqueeLabel, youtubeMarqueeLabel].map(
            (label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ),
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={toggleMusic}
        onMouseEnter={() => setHasHovered(true)}
        onFocus={() => setHasHovered(true)}
        className={`inline-flex h-12 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-inherit transition hover:scale-105 ${
          hasHovered ? "" : "animate-pulse"
        }`}
        aria-label={isMusicEnabled ? "Mute audio" : "Play audio"}
        aria-pressed={isMusicEnabled}
      >
        <span
          className={`sound-level-button__bars ${
            isMusicEnabled
              ? "sound-level-button__bars--active"
              : "sound-level-button__bars--muted"
          }`}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  );
}
