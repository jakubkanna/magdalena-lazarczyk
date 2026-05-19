import { useEffect, useRef } from "react";
import type { SiteContent } from "../data/site-content";
import { sanitizeContentHtml } from "../utils/html-content";

type CopiedContact = "email" | "phone" | null;

type BioContactPanelProps = {
  bioOpen: boolean;
  contactOpen: boolean;
  copiedContact: CopiedContact;
  onClose: () => void;
  onCopyContact: (value: string, key: Exclude<CopiedContact, null>) => void;
  siteContent: SiteContent;
  textColorClass?: "text-black/75" | "text-black/90";
};

const infoLabelClass = "text-sm font-normal leading-none";

export function BioContactPanel({
  bioOpen,
  contactOpen,
  onClose,
  siteContent,
  textColorClass = "text-black/75",
}: BioContactPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const { bio, contact } = siteContent;
  const isOpen = bioOpen || contactOpen;

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const panelElement = panelRef.current;
      if (!panelElement || !(event.target instanceof Node)) return;
      if (panelElement.contains(event.target)) return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-info-buttons]")
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, onClose]);

  return (
    <section
      ref={panelRef}
      className={`overflow-hidden bg-[#e8dfd0] px-2.5 transition-all duration-500 ease-out ${
        isOpen ? "h-svh py-2.5" : "h-0 py-0"
      }`}
    >
      <div className="flex h-full flex-col p-4">
        {bioOpen ? (
          <div
            key="bio"
            className={`info-panel-fade bio-scroll-fade h-full overflow-y-auto pb-12 pr-2 text-lg leading-[1.2] ${textColorClass} [scrollbar-color:#9a9a9a_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#e8dfd0] [&::-webkit-scrollbar-thumb]:bg-[#9a9a9a] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2.5`}
          >
            <h2 className={`mb-2 mt-0 ${infoLabelClass} ${textColorClass}`}>
              Bio
            </h2>
            <div
              className="wp-block-content wp-block-content-bio"
              dangerouslySetInnerHTML={{
                __html: sanitizeContentHtml(bio.html),
              }}
            />
          </div>
        ) : null}
        {contactOpen ? (
          <div
            key="contact"
            className={`info-panel-fade flex h-full flex-col items-end justify-center gap-1 text-right text-sm leading-tight ${textColorClass}`}
          >
            <h2 className={`mb-2 mt-0 ${infoLabelClass} ${textColorClass}`}>
              Kontakt
            </h2>
            <div
              className="wp-block-content wp-block-content-contact"
              dangerouslySetInnerHTML={{
                __html: sanitizeContentHtml(contact.html),
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
