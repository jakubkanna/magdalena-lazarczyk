import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type MusicConsent = "yes" | "no" | null;

type MusicConsentContextValue = {
  consent: MusicConsent;
  hasAnswered: boolean;
  isMusicEnabled: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  setConsent: (consent: Exclude<MusicConsent, null>) => void;
  toggleMusic: () => void;
};

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
};

type YouTubePlayerConstructor = new (
  elementId: string,
  options: {
    videoId: string;
    playerVars: Record<string, number | string>;
    events: {
      onReady: (event: { target: YouTubePlayer }) => void;
    };
  },
) => YouTubePlayer;

declare global {
  interface Window {
    YT?: {
      Player: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const musicConsentStorageKey = "magdalena-lazarczyk-music-consent";
const youtubeVideoId = "amwA16ye148";
let youtubeApiPromise: Promise<void> | null = null;

const MusicConsentContext = createContext<MusicConsentContextValue | null>(
  null,
);

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    window.onYouTubeIframeAPIReady = () => resolve();

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export function MusicConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<MusicConsent>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(musicConsentStorageKey);

    if (storedConsent === "yes" || storedConsent === "no") {
      setConsentState(storedConsent);
      setIsMusicEnabled(storedConsent === "yes");
    }
  }, []);

  useEffect(() => {
    if (consent !== "yes") {
      return;
    }

    let isMounted = true;

    loadYouTubeApi().then(() => {
      if (!isMounted || playerRef.current || !window.YT?.Player) {
        return;
      }

      playerRef.current = new window.YT.Player("site-music-player", {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: youtubeVideoId,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(Math.round(volume * 100));

            if (isMusicEnabled) {
              event.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
    };
  }, [consent, isMusicEnabled, volume]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (isMusicEnabled) {
      playerRef.current.playVideo();
      return;
    }

    playerRef.current.pauseVideo();
  }, [isMusicEnabled]);

  const setVolume = (nextVolume: number) => {
    setVolumeState(nextVolume);
    playerRef.current?.setVolume(Math.round(nextVolume * 100));
  };

  const setConsent = (nextConsent: Exclude<MusicConsent, null>) => {
    window.localStorage.setItem(musicConsentStorageKey, nextConsent);
    setConsentState(nextConsent);
    setIsMusicEnabled(nextConsent === "yes");
  };

  const value = useMemo<MusicConsentContextValue>(
    () => ({
      consent,
      hasAnswered: consent !== null,
      isMusicEnabled,
      volume,
      setVolume,
      setConsent,
      toggleMusic: () => setIsMusicEnabled((currentValue) => !currentValue),
    }),
    [consent, isMusicEnabled, volume],
  );

  return (
    <MusicConsentContext.Provider value={value}>
      {children}
      {consent === "yes" ? (
        <div
          id="site-music-player"
          className="site-music-player"
          aria-hidden="true"
        />
      ) : null}
    </MusicConsentContext.Provider>
  );
}

export function useMusicConsent() {
  const context = useContext(MusicConsentContext);

  if (!context) {
    throw new Error("useMusicConsent must be used inside MusicConsentProvider");
  }

  return context;
}
