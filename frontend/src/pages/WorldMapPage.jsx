/**
 * WorldMapPage.jsx
 * Thin wrapper that renders the original HackX World Map
 * as a full-screen page inside the app router.
 * It temporarily hides the Layout sidebar for immersion.
 */
import { useEffect } from "react";
import WorldMap from "../WorldMap";

export default function WorldMapPage() {
  // Temporarily suppress the layout padding for this full-screen page
  useEffect(() => {
    const main = document.querySelector(".layout__main");
    if (main) {
      main.style.padding = "0";
      main.style.overflow = "hidden";
    }
    return () => {
      if (main) {
        main.style.padding = "";
        main.style.overflow = "";
      }
    };
  }, []);

  return <WorldMap />;
}
