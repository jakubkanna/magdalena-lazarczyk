import wordpressSiteContent from "./wordpress-site-content.json";

export type BioExhibitionColumn = {
  title: string;
  items: string[];
};

export type SiteContent = {
  bio: {
    portrait: {
      alt: string;
      src: string;
    };
    paragraphs: string[];
    exhibitionColumns: BioExhibitionColumn[];
  };
  contact: {
    email: string;
    phone: string;
    instagramUrl: string;
  };
};

type WordPressPage = {
  acf?: unknown;
  content?: {
    rendered?: string;
  };
};

export const defaultSiteContent = wordpressSiteContent as SiteContent;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isExhibitionColumns(value: unknown): value is BioExhibitionColumn[] {
  return (
    Array.isArray(value) &&
    value.every(
      (column) =>
        typeof column === "object" &&
        column !== null &&
        typeof (column as BioExhibitionColumn).title === "string" &&
        isStringArray((column as BioExhibitionColumn).items),
    )
  );
}

function getRecordValue(value: unknown, key: string) {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function parseWordPressSiteContent(value: unknown): SiteContent | null {
  if (!value || typeof value !== "object") return null;

  const acf = (value as WordPressPage).acf;
  if (!acf || typeof acf !== "object") return null;

  const fields = acf as Partial<SiteContent> & {
    bio_paragraphs?: unknown;
    bio_exhibition_columns?: unknown;
    bio_portrait?: { alt?: unknown; url?: unknown };
    contact_email?: unknown;
    contact_instagram_url?: unknown;
    contact_phone?: unknown;
  };

  const paragraphs = fields.bio?.paragraphs ?? fields.bio_paragraphs;
  const exhibitionColumns =
    fields.bio?.exhibitionColumns ?? fields.bio_exhibition_columns;
  const portrait = fields.bio?.portrait ?? fields.bio_portrait;
  const email = fields.contact?.email ?? fields.contact_email;
  const phone = fields.contact?.phone ?? fields.contact_phone;
  const instagramUrl =
    fields.contact?.instagramUrl ?? fields.contact_instagram_url;
  const portraitAlt = getRecordValue(portrait, "alt");
  const portraitSrc = getRecordValue(portrait, "src");
  const portraitUrl = getRecordValue(portrait, "url");

  if (
    !isStringArray(paragraphs) ||
    !isExhibitionColumns(exhibitionColumns) ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof instagramUrl !== "string"
  ) {
    return null;
  }

  return {
    bio: {
      portrait: {
        alt:
          typeof portraitAlt === "string"
            ? portraitAlt
            : defaultSiteContent.bio.portrait.alt,
        src:
          typeof portraitSrc === "string"
            ? portraitSrc
            : typeof portraitUrl === "string"
              ? portraitUrl
              : defaultSiteContent.bio.portrait.src,
      },
      paragraphs,
      exhibitionColumns,
    },
    contact: {
      email,
      phone,
      instagramUrl,
    },
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const wordpressApiUrl = import.meta.env.VITE_WORDPRESS_API_URL as
    | string
    | undefined;

  if (!wordpressApiUrl) {
    return defaultSiteContent;
  }

  try {
    const response = await fetch(
      `${wordpressApiUrl.replace(/\/$/, "")}/wp-json/wp/v2/pages?slug=bio`,
    );
    if (!response.ok) return defaultSiteContent;

    const pages = (await response.json()) as WordPressPage[];
    const content = parseWordPressSiteContent(pages[0]);
    return content ?? defaultSiteContent;
  } catch {
    return defaultSiteContent;
  }
}
