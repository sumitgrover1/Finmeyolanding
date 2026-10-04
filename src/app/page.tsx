import type { Metadata } from "next";
import { fetchConfig, fetchContent, fetchRates } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { LoansPage } from "@/components/LoansPage";

/**
 * loan.finmeyo.com — the Gurgaon loans landing page.
 *
 * Its own host and its own repository, so the code can be handed to somebody
 * without handing them the console, the lender rules or the customer records.
 * It holds no database credentials and no secrets of any kind: the rates it
 * shows and the leads it captures both travel over the main site's public
 * endpoints — see src/lib/api.ts.
 *
 * Revalidated rather than rendered per request. This sits behind paid traffic,
 * where the first paint is what the money buys, and being a minute behind the
 * console is fine. The copy, the rates and the contact details are all cached
 * reads of the main site.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: `${content.meta.title} | ${SITE_NAME}`,
    description: content.meta.description,
    keywords: content.meta.keywords,
    alternates: { canonical: "/" },
    robots: { index: content.meta.noindex !== true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: content.meta.ogTitle,
      description: content.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.ogTitle,
      description: content.meta.ogDescription,
    },
    other: {
      "geo.region": content.meta.geoRegion,
      "geo.placename": content.meta.geoPlace,
    },
  };
}

export default async function Page() {
  // Both reads fail soft: a landing page that 500s because an API was slow
  // costs the click and, repeated, the ad account's quality score.
  const [content, rates, config] = await Promise.all([
    fetchContent(),
    fetchRates(),
    fetchConfig(),
  ]);

  /**
   * Structured data, built from the same objects the page renders.
   *
   * Written from the content rather than kept as a second copy: a FAQ block
   * whose answers disagree with the answers on the page is the one kind of
   * structured-data error that gets a site penalised rather than ignored.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["FinancialService", "LocalBusiness"],
        "@id": `${SITE_URL}/#organisation`,
        name: config.contact.legalName,
        url: SITE_URL,
        telephone: config.contact.phone,
        email: config.contact.email,
        areaServed: content.areas.groups
          .flatMap((group) => group.areas ?? [])
          .map((area) => area.name)
          .slice(0, 30),
        address: {
          "@type": "PostalAddress",
          streetAddress: config.contact.addressLine1,
          addressLocality: content.meta.geoPlace,
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/`,
        url: `${SITE_URL}/`,
        name: content.meta.title,
        description: content.meta.description,
        isPartOf: { "@id": `${SITE_URL}/#organisation` },
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LoansPage
        content={content}
        contact={config.contact}
        lenderNames={rates?.lenders ?? []}
        rates={rates}
        gaId={config.gaId}
        gtmId={config.gtmId}
      />
    </>
  );
}
