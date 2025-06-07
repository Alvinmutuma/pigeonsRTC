import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteName = 'PigeonRTC - AI Agent Marketplace'; // Default site name
  const pageTitle = title ? `${title} | ${siteName}` : siteName;

  // Basic website schema - can be expanded later
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "alternateName": "AI Agents Marketplace",
    "url": "https://pigeonrtc.com", // Replace with your actual domain
    "description": description || "Discover and integrate autonomous AI agents for your business. Streamline operations with our curated marketplace of specialized AI solutions.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pigeonrtc.com/search?q={search_term_string}" // Replace with your actual domain
      },
      "query-input": "required name=search_term_string"
    }
  };

  // For now, breadcrumb is simple. Can be made dynamic later.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pigeonrtc.com" // Replace with your actual domain
      },
      // Add more items here if 'title' is present, representing the current page
      ...(title ? [{
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": url || `https://pigeonrtc.com${window.location.pathname}` // Replace with your actual domain
      }] : [])
    ]
  };

  return (
    <Helmet>
      {/* Standard HTML Meta Tags */}
      <title>{pageTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || siteName} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title || siteName} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      {/* <meta name="twitter:site" content="@yourtwitterhandle" /> */}
      {/* <meta name="twitter:creator" content="@yourtwitterhandle" /> */}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

SEO.defaultProps = {
  title: "PigeonRTC - AI Agents Marketplace",
  description: "Discover and integrate autonomous AI agents for your business. Streamline operations with our curated marketplace of specialized AI solutions.",
  image: "https://pigeonrtc.com/images/og-image.png",
  url: "https://pigeonrtc.com"
};

export default SEO;