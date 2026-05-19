export type SiteContent = {
  bio: {
    html: string;
  };
  contact: {
    html: string;
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

export const defaultSiteContent: SiteContent = {
  bio: {
    html: "",
  },
  contact: {
    html: "",
    email: "",
    phone: "",
    instagramUrl: "",
  },
};

function parseWordPressSiteContent(
  bioPage: WordPressPage | undefined,
  contactPage: WordPressPage | undefined,
): SiteContent | null {
  const bioHtml = bioPage?.content?.rendered;
  const contactHtml = contactPage?.content?.rendered;
  if (!bioHtml || !contactHtml) return null;

  const contactAcf =
    contactPage?.acf && typeof contactPage.acf === "object"
      ? (contactPage.acf as Record<string, unknown>)
      : {};

  return {
    bio: {
      html: bioHtml,
    },
    contact: {
      html: contactHtml,
      email:
        typeof contactAcf.contact_email === "string"
          ? contactAcf.contact_email
          : defaultSiteContent.contact.email,
      phone:
        typeof contactAcf.contact_phone === "string"
          ? contactAcf.contact_phone
          : defaultSiteContent.contact.phone,
      instagramUrl:
        typeof contactAcf.contact_instagram_url === "string"
          ? contactAcf.contact_instagram_url
          : defaultSiteContent.contact.instagramUrl,
    },
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const configuredUrl = import.meta.env.VITE_WORDPRESS_API_URL as
    | string
    | undefined;
  const wordpressApiUrl =
    configuredUrl || (import.meta.env.DEV ? "http://localhost:8081" : undefined);

  if (!wordpressApiUrl) {
    return defaultSiteContent;
  }

  try {
    const apiBase = wordpressApiUrl.replace(/\/$/, "");
    const [bioResponse, contactResponse] = await Promise.all([
      fetch(`${apiBase}/wp-json/wp/v2/pages?slug=bio`),
      fetch(`${apiBase}/wp-json/wp/v2/pages?slug=contact`),
    ]);
    if (!bioResponse.ok || !contactResponse.ok) return defaultSiteContent;

    const [bioPages, contactPages] = (await Promise.all([
      bioResponse.json(),
      contactResponse.json(),
    ])) as [WordPressPage[], WordPressPage[]];
    const bioPage = bioPages[0];
    const contactPage = contactPages[0];
    const content = parseWordPressSiteContent(bioPage, contactPage);
    return content ?? defaultSiteContent;
  } catch {
    return defaultSiteContent;
  }
}
