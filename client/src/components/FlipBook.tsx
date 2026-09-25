import HTMLFlipBook from "react-pageflip";
import type { ComponentType, CSSProperties, ReactNode, Ref } from "react";
// StPageFlip positions its pages from this stylesheet and react-pageflip does
// not pull it in. Without it every page measures zero and no book appears.
import "page-flip/src/Style/stPageFlip.css";

/** The handful of StPageFlip methods this site actually calls. */
export interface PageFlipApi {
  flip: (page: number, corner?: "top" | "bottom") => void;
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  turnToPage: (page: number) => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
}

export interface FlipBookHandle {
  pageFlip: () => PageFlipApi | undefined;
}

export interface FlipEvent {
  data: number;
}

export interface OrientationEvent {
  data: "portrait" | "landscape";
}

interface FlipBookProps {
  width: number;
  height: number;
  size?: "fixed" | "stretch";
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Hard covers, shown one page at a time. */
  showCover?: boolean;
  usePortrait?: boolean;
  maxShadowOpacity?: number;
  flippingTime?: number;
  drawShadow?: boolean;
  mobileScrollSupport?: boolean;
  useMouseEvents?: boolean;
  clickEventForward?: boolean;
  disableFlipByClick?: boolean;
  startPage?: number;
  autoSize?: boolean;
  className?: string;
  style?: CSSProperties;
  onFlip?: (event: FlipEvent) => void;
  onChangeOrientation?: (event: OrientationEvent) => void;
  children: ReactNode;
  ref?: Ref<FlipBookHandle>;
}

/**
 * react-pageflip types every setting as required and types its ref as `any`.
 * One cast here, in one file, keeps both books' call sites typed and honest.
 */
export const FlipBook = HTMLFlipBook as unknown as ComponentType<FlipBookProps>;
