/* eslint-disable */
// @ts-nocheck
"use client";
// Vendored/adapted from React Bits — TiltedCard (motion). Adapted for this site:
// fills its parent (responsive) and renders arbitrary `children` so we can pass
// the optimized <Img> (Next image + blur) instead of a raw <img>. Tooltip and
// mobile-warning default off; `lastY` is a ref (no re-render on every move).
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const springValues = { damping: 30, stiffness: 100, mass: 2 };

export default function TiltedCard({
  children,
  imageSrc = "",
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "100%",
  containerWidth = "100%",
  scaleOnHover = 1.08,
  rotateAmplitude = 12,
  showTooltip = false,
  overlayContent = null,
  displayOverlayContent = false,
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

  const lastY = useRef(0);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  function handleMouse(e) {
    if (reduced.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY.current;
    rotateFigcaption.set(-velocityY * 0.6);
    lastY.current = offsetY;
  }

  function handleMouseEnter() {
    if (reduced.current) return;
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div className="tilted-card-inner" style={{ rotateX, rotateY, scale }}>
        {children ?? <img src={imageSrc} alt={altText} className="tilted-card-img" />}
        {displayOverlayContent && overlayContent && (
          <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
