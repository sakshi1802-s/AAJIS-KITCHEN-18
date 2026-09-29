import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { Curtain } from "./Curtain";
import { randomSlogan } from "./slogans";

const SHOW_MS = 650;

/**
 * A short curtain between pages. Deliberately brief — a beat, not a wait.
 *
 * Rendered only while it is showing, so nothing is left over afterwards.
 */
export function PageLoader() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [slogan, setSlogan] = useState(randomSlogan);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSlogan(randomSlogan());
    setVisible(true);
    const id = setTimeout(() => setVisible(false), SHOW_MS);
    return () => {
      clearTimeout(id);
      setVisible(false);
    };
  }, [pathname]);

  if (!visible) return null;
  return <Curtain slogan={slogan} />;
}
