import DOMPurify from "dompurify";

const allowedTags = [
  "a",
  "blockquote",
  "br",
  "cite",
  "div",
  "em",
  "figcaption",
  "figure",
  "h2",
  "h3",
  "h4",
  "i",
  "iframe",
  "img",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "ul",
];

const allowedAttributes = [
  "alt",
  "allow",
  "allowfullscreen",
  "class",
  "data-id",
  "decoding",
  "frameborder",
  "fullscreen",
  "height",
  "href",
  "loading",
  "mozallowfullscreen",
  "rel",
  "referrerpolicy",
  "scrolling",
  "sizes",
  "src",
  "srcset",
  "target",
  "title",
  "webkitallowfullscreen",
  "width",
];

function isAllowedEmbedSource(src: string) {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      (url.hostname === "player.vimeo.com" ||
        url.hostname === "vimeo.com" ||
        url.hostname === "www.vimeo.com")
    );
  } catch {
    return false;
  }
}

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName !== "iframe") return;

  const iframe = node as HTMLIFrameElement;
  const src = iframe.getAttribute("src");
  if (!src || !isAllowedEmbedSource(src)) {
    iframe.parentNode?.removeChild(iframe);
  }
});

export function sanitizeContentHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: allowedAttributes,
    ALLOWED_TAGS: allowedTags,
  });
}
