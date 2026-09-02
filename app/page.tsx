import { Hero } from "@/components/marketing/Hero";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { PermissionLevels } from "@/components/marketing/PermissionLevels";
import { WhyWebMCP } from "@/components/marketing/WhyWebMCP";
import { Footer } from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-canvas">
      <Hero />
      <ProductPreview />
      <PermissionLevels />
      <WhyWebMCP />
      <Footer />
    </main>
  );
}
