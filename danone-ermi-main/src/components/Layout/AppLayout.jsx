import { useEffect } from "react";
import ErrorBoundary from "../ErrorBoundary";
import Viewer from "../Scene/Viewer";
import Sidebar from "../UI/Sidebar";
import FilterBar from "../UI/FilterBar";
import Navigation from "../UI/Navigation";
import LoadingScreen from "../UI/LoadingScreen";
import Onboarding from "../UI/Onboarding";
import Header from "../UI/Header";
import useAppStore from "../../store/useAppStore";
import { trackHotspotSelect } from "../../utils/analytics";

export default function AppLayout() {
  // GA4: report every risk point the user opens (marker click or prev/next nav).
  const activeHotspot = useAppStore((s) => s.activeHotspot);
  const hotspots = useAppStore((s) => s.hotspots);
  useEffect(() => {
    if (activeHotspot == null) return;
    const h = hotspots.find((x) => x.id === activeHotspot);
    if (h) trackHotspotSelect(h);
  }, [activeHotspot, hotspots]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 3D viewer fills the viewport */}
      <div className="absolute inset-0">
        <ErrorBoundary>
          <Viewer />
        </ErrorBoundary>
      </div>

      {/* UI overlay. z-20 sits above drei's <Html> hotspot labels (capped at
          z-9) so the 3D markers can never paint over the header or the nav.
          pointer-events-none here; each control opts back in. */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
        <div className="p-3 md:p-4">
          <Header />
        </div>

        {/* Filters get their own full-width row. Eight chips carrying a
            pictogram, a label and a count do not fit beside the header on a
            laptop — sharing that row silently clipped the last two categories. */}
        <div className="px-3 md:px-4 -mt-1">
          <FilterBar />
        </div>

        <div className="flex-1" />

        <div className="flex justify-center px-3 pb-3 md:pb-4">
          <Navigation />
        </div>
      </div>

      <Sidebar />
      <LoadingScreen />
      {/* Above the loading screen: the model streams in behind the tutorial. */}
      <Onboarding />
    </div>
  );
}
