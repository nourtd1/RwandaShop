import { Suspense } from "react";
import type { Metadata } from "next";

import HeroSection              from "@/components/home/HeroSection";
import StatsSection             from "@/components/home/StatsSection";
import CategoryBar              from "@/components/home/CategoryBar";
import FeaturedProducts         from "@/components/home/FeaturedProducts";
import FeaturedProductsSkeleton from "@/components/home/FeaturedProductsSkeleton";
import PromoBanner              from "@/components/home/PromoBanner";
import WhyUsSection             from "@/components/home/WhyUsSection";

export const metadata: Metadata = {
  title: "Home — Authentic Rwandan Crafts",
  description:
    "Discover and buy authentic Rwandan crafts: Agaseke basketry, Imigongo sculptures, Kitenge textiles and jewellery. Delivered across Rwanda. Every purchase directly supports local artisans.",
  openGraph: {
    title:       "RwandaShop — Rwandan crafts at your fingertips",
    description: "Marketplace dedicated to Rwandan crafts. Support local artisans.",
    type:        "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CategoryBar />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <PromoBanner />
      <WhyUsSection />
    </>
  );
}
