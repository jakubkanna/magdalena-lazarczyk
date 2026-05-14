type FixedInfoButtonsProps = {
  bioOpen: boolean;
  contactOpen: boolean;
  onBioClick: () => void;
  onContactClick: () => void;
};

export function FixedInfoButtons({
  bioOpen,
  contactOpen,
  onBioClick,
  onContactClick,
}: FixedInfoButtonsProps) {
  const infoOpen = bioOpen || contactOpen;
  const onCloseClick = bioOpen ? onBioClick : onContactClick;

  return (
    <div
      className="fixed right-2.5 top-2.5 z-50 flex items-center gap-2"
      data-info-buttons
    >
      <button
        type="button"
        className={`min-h-0 cursor-pointer rounded-full px-2 py-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:text-black max-md:min-h-11 max-md:px-3 max-md:py-2 ${
          bioOpen
            ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]"
            : "bg-[#eee4d5] hover:bg-[#e0d6c7]"
        }`}
        onClick={onBioClick}
      >
        <span className="button-text-shake">Bio</span>
      </button>
      <button
        type="button"
        className={`inline-flex cursor-pointer items-center justify-center rounded-full p-1 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:text-black max-md:size-11 ${
          contactOpen
            ? "bg-[#dfd5c6] hover:bg-[#d2c7b8]"
            : "bg-[#eee4d5] hover:bg-[#e0d6c7]"
        }`}
        onClick={onContactClick}
        aria-label="Kontakt"
        >
          <img
            className="button-text-shake block size-4"
            src={`${import.meta.env.BASE_URL}frontpage/call-outline.svg`}
            alt=""
          aria-hidden="true"
        />
      </button>
      {infoOpen ? (
        <button
          type="button"
          className="flex size-6 cursor-pointer appearance-none items-center justify-center rounded-full border-0 bg-[#eee4d5] p-0 text-base leading-none text-black/75 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[background-color,color] duration-200 hover:bg-[#e0d6c7] hover:text-black max-md:size-11"
          onClick={onCloseClick}
          aria-label={bioOpen ? "Zamknij Bio" : "Zamknij Kontakt"}
        >
          <span
            className="button-text-shake block size-4 bg-current"
            style={{
              WebkitMask: `url("${import.meta.env.BASE_URL}close.svg") center / contain no-repeat`,
              mask: `url("${import.meta.env.BASE_URL}close.svg") center / contain no-repeat`,
            }}
            aria-hidden="true"
          />
        </button>
      ) : null}
    </div>
  );
}
