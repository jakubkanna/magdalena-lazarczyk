import DOMPurify from "dompurify";

const allowedTags = [
  "a",
  "br",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "ul",
];

const allowedAttributes = ["href", "rel", "target"];

export function sanitizeContentHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: allowedAttributes,
    ALLOWED_TAGS: allowedTags,
  });
}
