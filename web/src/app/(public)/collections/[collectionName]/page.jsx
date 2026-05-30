import CollectionsDetails from "@/features/collections/collections_deatils/CollectionsDetails";
import { Metadata } from "next";

// Generate metadata dynamically based on the collection name
export async function generateMetadata({ params, searchParams }) {
  const { collectionName } = params;
  const decodedCollectionName = decodeURIComponent(collectionName);
  
  // You can fetch collection data here if needed for dynamic metadata
  // const collectionData = await getCollectionByName(decodedCollectionName);
  
  return {
    title: `${decodedCollectionName} Collection | Book Collections`,
    description: `Explore the ${decodedCollectionName} collection - curated books with unique themes, insights, and recommendations. Discover your next favorite read from our hand-picked selection.`,
    keywords: `${decodedCollectionName}, book collection, curated books, reading list, ${decodedCollectionName} books, recommended reading`,
    authors: [{ name: "BookQubit" }],
    openGraph: {
      title: `${decodedCollectionName} Collection | Book Collections`,
      description: `Explore the ${decodedCollectionName} collection - curated books with unique themes and insights. Discover your next favorite read.`,
      type: "website",
      url: `https://bookqubit.com/collections/${encodeURIComponent(decodedCollectionName)}`,
      images: [
        {
          url: "https://bookqubit.com/og-collection.jpg",
          width: 1200,
          height: 630,
          alt: `${decodedCollectionName} Collection`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${decodedCollectionName} Collection | Book Collections`,
      description: `Explore the ${decodedCollectionName} collection - curated books with unique themes and insights.`,
      images: ["https://bookqubit.com/twitter-collection.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://bookqubit.com/collections/${encodeURIComponent(decodedCollectionName)}`,
    },
  };
}

export default function CollectionDetailsPage() {
  return <CollectionsDetails />;
}