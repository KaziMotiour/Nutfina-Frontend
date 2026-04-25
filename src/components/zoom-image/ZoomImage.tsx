import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import "./ZoomImage.css";

type ZoomImageProps = {
  src: string;
  alt?: string;
  /** Lower = less zoom (library default is 1). Try 0.5–0.9. */
  zoomScale?: number;
};

const DEFAULT_ZOOM_SCALE = 0.25;

const ZoomImage = ({ src, alt = "", zoomScale = DEFAULT_ZOOM_SCALE }: ZoomImageProps) => {
  if (!src) return null;

  return (
    <div>
      <InnerImageZoom
        key={src}
        src={src}
        zoomSrc={src}
        alt={alt}
        zoomScale={zoomScale}
        zoomType="hover"
        zoomPreload={true}
        style={{ cursor: "zoom-in" }}
        hideHint={false}
        imgAttributes={{ loading: "eager" as const }}
      />
    </div>
  );
};

export default ZoomImage;
