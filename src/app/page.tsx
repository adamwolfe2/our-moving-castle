// Scroll canvas: Entry → House (WebGL + hotspots) → Plan (room bento) → 7 Rooms (real+inspo) → Tour (3D helix) → Reference → Stay → Home → Footer.

import { TopBar } from "@/components/TopBar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { EntryPortal } from "@/components/EntryPortal";
import { ExteriorHero } from "@/components/ExteriorHero";
import { TourOverlay } from "@/components/TourOverlay";
import { FeaturesBento } from "@/components/FeaturesBento";
import { RoomSection } from "@/components/RoomSection";
import { Gallery3D } from "@/components/Gallery3D";
import { InspirationBoard } from "@/components/InspirationBoard";
import { Newsletter } from "@/components/Newsletter";
import { StorySection } from "@/components/StorySection";
import { Footer } from "@/components/Footer";
import { RoomStrip } from "@/components/RoomStrip";
import { Cursor } from "@/components/Cursor";
import { ROOMS } from "@/lib/rooms";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <TopBar />
      <RoomStrip />
      <TourOverlay />
      <main className="bg-cream">
        <EntryPortal />
        <ExteriorHero />
        <FeaturesBento />
        {ROOMS.map((room, i) => (
          <RoomSection key={room.id} room={room} index={i} />
        ))}
        <Gallery3D />
        <InspirationBoard />
        <Newsletter />
        <StorySection />
        <Footer />
      </main>
    </>
  );
}
