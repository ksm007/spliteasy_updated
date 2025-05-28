"use client";

import React, { useRef, useCallback, useEffect } from "react";

interface ResizableProps {
  children: ({
    ref,
  }: {
    ref: React.RefObject<HTMLDivElement>;
  }) => React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ children }) => {
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const startX = e.clientX;
    const column = resizerRef.current?.closest("th") as HTMLElement;
    const startWidth = column?.offsetWidth || 0;

    const handleMouseMove = (e: MouseEvent) => {
      const width = startWidth + e.clientX - startX;
      if (width >= 50 && column) {
        // minimum width of 50px
        column.style.width = `${width}px`;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();

    const startX = e.touches[0].clientX;
    const column = resizerRef.current?.closest("th") as HTMLElement;
    const startWidth = column?.offsetWidth || 0;

    const handleTouchMove = (e: TouchEvent) => {
      const width = startWidth + e.touches[0].clientX - startX;
      if (width >= 50 && column) {
        column.style.width = `${width}px`;
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  }, []);

  useEffect(() => {
    const node = resizerRef.current;
    if (!node) return;

    node.addEventListener("mousedown", handleMouseDown);
    node.addEventListener("touchstart", handleTouchStart);

    return () => {
      node.removeEventListener("mousedown", handleMouseDown);
      node.removeEventListener("touchstart", handleTouchStart);
    };
  }, [handleMouseDown, handleTouchStart]);

  return <>{children({ ref: resizerRef })}</>;
};

export default Resizable;
