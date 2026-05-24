"use client";

import { useEffect, useState } from "react";

export function useRouletteSize() {
  const [size, setSize] = useState({ itemWidth: 72, itemHeight: 80 });

  useEffect(() => {
    const update = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      setSize(
        mobile
          ? { itemWidth: 56, itemHeight: 64 }
          : { itemWidth: 72, itemHeight: 80 }
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}
