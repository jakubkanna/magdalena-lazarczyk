import { useEffect, useRef } from "react";
import type { SiteContent } from "../data/site-content";
import { sanitizeContentHtml } from "../utils/html-content";

type CopiedContact = "email" | "phone" | null;

type BioContactPanelProps = {
  bioExpanded: boolean;
  bioOpen: boolean;
  contactOpen: boolean;
  copiedContact: CopiedContact;
  onBioExpand: () => void;
  onClose: () => void;
  onCopyContact: (value: string, key: Exclude<CopiedContact, null>) => void;
  siteContent: SiteContent;
  textColorClass?: "text-black/75" | "text-black/90";
};

const tooltipClass =
  "absolute right-0 top-full z-[9999] mt-1 rounded-full bg-[#eee4d5] px-2 py-1 text-xs leading-none shadow-[0_2px_8px_rgba(0,0,0,0.16)]";

export function BioContactPanel({
  bioExpanded,
  bioOpen,
  contactOpen,
  copiedContact,
  onBioExpand,
  onClose,
  onCopyContact,
  siteContent,
  textColorClass = "text-black/75",
}: BioContactPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const { bio, contact } = siteContent;
  const firstBioParagraph = bio.paragraphs[0] ?? "";
  const portraitSrc = bio.portrait.src.startsWith("http")
    ? bio.portrait.src
    : `${import.meta.env.BASE_URL}${bio.portrait.src}`;
  const isOpen = bioOpen || contactOpen;

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const panelElement = panelRef.current;
      if (!panelElement || !(event.target instanceof Node)) return;
      if (panelElement.contains(event.target)) return;
      onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, onClose]);

  return (
    <section
      ref={panelRef}
      className={`overflow-hidden bg-[#e8dfd0] px-2.5 transition-all duration-500 ease-out ${
        isOpen
          ? bioExpanded
            ? "h-[50svh] py-2.5"
            : "h-29.5 py-2.5"
          : "h-0 py-0"
      }`}
    >
      <div className="flex h-full flex-col p-4">
        {bioOpen && !bioExpanded ? (
          <div key="bio-preview" className="info-panel-fade flex h-full flex-col">
            <div
              className={`m-0 text-sm leading-tight ${textColorClass}`}
              dangerouslySetInnerHTML={{
                __html: sanitizeContentHtml(firstBioParagraph),
              }}
            />
            <button
              type="button"
              className={`mb-0 ml-auto mt-auto cursor-pointer text-base leading-none underline transition-colors duration-200 hover:text-black ${textColorClass}`}
              onClick={onBioExpand}
            >
              czytaj dalej
            </button>
          </div>
        ) : null}
        {bioExpanded ? (
          <div
            key="bio-expanded"
            className={`info-panel-fade bio-scroll-fade mt-2 overflow-y-auto pb-12 pr-2 text-sm leading-[1.2] ${textColorClass} [scrollbar-color:#9a9a9a_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#e8dfd0] [&::-webkit-scrollbar-thumb]:bg-[#9a9a9a] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2.5`}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_calc(100vw/12)] gap-5 max-md:grid-cols-1">
              <div className="columns-2 gap-5 max-lg:columns-1">
                <h2 className={`mb-2 mt-0 text-xs font-bold uppercase ${textColorClass}`}>
                  Bio
                </h2>
                {bio.paragraphs.map((paragraph) => (
                  <div
                    key={paragraph.slice(0, 20)}
                    className="mb-3 mt-0 break-inside-avoid"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeContentHtml(paragraph),
                    }}
                  />
                ))}
              </div>
              <img
                className="block h-auto w-full self-start object-cover"
                src={portraitSrc}
                alt={bio.portrait.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-5 pt-4 max-md:grid-cols-1">
              {bio.exhibitionColumns.map((column) => (
                <section key={column.title}>
                  <h2 className={`mb-2 mt-0 text-xs font-bold uppercase ${textColorClass}`}>
                    {column.title}
                  </h2>
                  <ul className="m-0 list-none p-0">
                    {column.items.map((item) => (
                      <li key={item} className="mb-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ) : null}
        {contactOpen ? (
          <div
            key="contact"
            className={`info-panel-fade flex h-full flex-col items-end justify-center gap-1 text-right text-sm leading-tight ${textColorClass}`}
          >
            <h2 className={`mb-2 mt-0 text-xs font-bold uppercase ${textColorClass}`}>
              Kontakt
            </h2>
            <button
              type="button"
              className={`relative w-fit cursor-pointer appearance-none border-0 bg-transparent p-0 text-right underline transition-colors duration-200 hover:text-black ${textColorClass}`}
              onClick={() => onCopyContact(contact.email, "email")}
            >
              {contact.email}
              {copiedContact === "email" ? (
                <span className={`${tooltipClass} ${textColorClass}`}>
                  skopiowano
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={`relative w-fit cursor-pointer appearance-none border-0 bg-transparent p-0 text-right underline transition-colors duration-200 hover:text-black ${textColorClass}`}
              onClick={() => onCopyContact(contact.phone, "phone")}
            >
              {contact.phone}
              {copiedContact === "phone" ? (
                <span className={`${tooltipClass} ${textColorClass}`}>
                  skopiowano
                </span>
              ) : null}
            </button>
            <a
              className={`w-fit underline transition-colors duration-200 hover:text-black ${textColorClass}`}
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              instagram
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
