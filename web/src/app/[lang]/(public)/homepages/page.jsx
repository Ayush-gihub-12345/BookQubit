"use client";

import HeroSectionSlider from "@/components/homepages/HeroSectionSlider";
import HeroPartOne from "@/components/homepages/HeroPartOne";
import ExploreBooks from "@/components/homepages/ExploreBooks";
import ExploreCollections from "@/components/homepages/ExploreCollections";
import ExploreAuthor from "@/components/homepages/ExploreAuthor";
import ExplorePublications from "@/components/homepages/ExplorePublications";
import ExploreComics from "@/components/homepages/ExploreComics";
import ExploreAcademicBooks from "@/components/homepages/ExploreAcademicBooks";
import ThirdPartyAD from "@/components/homepages/ThirdPartyAD";
import QuickActions from "@/components/homepages/QuickActions";
import LaunchYourBook from "@/components/homepages/LunchYourBook";
import DiscoveryPlatform from "@/components/homepages/DiscoveryPlatform";
import AiTools from "@/components/homepages/AiTools";
import TrendDashboardSlider from "@/components/homepages/trend_dashboard_slider";
import TagsHome from "@/components/homepages/TagsHome";
import HeroSectionSlider_mobile from "@/components/homepages/mobile_homepages/HeroSectionSlider_mobile";

export default function HomepagesPage() {
  return (
    <main>
      {/* <DiscoveryPlatform /> */}
      {/* <HeroSectionSlider_mobile /> */}
      <HeroSectionSlider />
      <TrendDashboardSlider />
      {/* <TagsHome /> */}

      {/* <ThirdPartyAD /> */}
      <HeroPartOne />
      <QuickActions />
      <ExploreBooks />
      <ExploreAcademicBooks />
      <ExploreCollections />
      <ExploreAuthor />
      <ExplorePublications />
      <ExploreComics />
      {/* <LaunchYourBook />
      <AiTools /> */}
    </main>
  );
}
