import { useLocation } from "react-router-dom";
import { useEffect } from "react";

type SeoConfig = {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article" | "product" | "blog";
  [key: string]: string | undefined;
};

export const useSEO = (seo: SeoConfig) => {
  const { title, description, image, type = "website", ...extra } = seo;
  const location = useLocation();

  useEffect(() => {
    // Update page title
    if (title) {
      /* eslint-disable react-hooks/immutability */
      document.title = title;
      /* eslint-enable react-hooks/immutability */
    }

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      document.head.appendChild(metaDesc);
    }
    if (description && metaDesc.setAttribute) {
      metaDesc.setAttribute("name", "description");
      metaDesc.setAttribute("content", description);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.setAttribute) {
      ogTitle.setAttribute("content", title || "");
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && ogDescription.setAttribute) {
      ogDescription.setAttribute("content", description || "");
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType && ogType.setAttribute) {
      ogType.setAttribute("content", type || "");
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.setAttribute) {
      ogImage.setAttribute("content", image || "");
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && ogUrl.setAttribute) {
      ogUrl.setAttribute("content", location.pathname);
    }

    // Update Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard && twitterCard.setAttribute) {
      twitterCard.setAttribute(
        "content",
        type === "product" ? "product" : "summary_large_image"
      );
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && twitterTitle.setAttribute) {
      twitterTitle.setAttribute("content", title || "");
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && twitterDescription.setAttribute) {
      twitterDescription.setAttribute("content", description || "");
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.setAttribute) {
      twitterImage.setAttribute("content", image || "");
    }

    // Apply any additional SEO parameters
    Object.entries(extra).forEach(([key, value]) => {
      if (value === undefined) return;
      const existing = document.querySelector(`meta[name="${key}"]`) || document.querySelector(`meta[property="${key}"]`);
      if (existing && existing.setAttribute) {
        existing.setAttribute("content", String(value));
      } else {
        const meta = document.createElement("meta");
        meta.name = key;
        meta.setAttribute("content", String(value));
        document.head.appendChild(meta);
      }
    });
  }, [title, description, image, type, location.pathname, JSON.stringify(extra)]);
};

export default useSEO;