import FadeLoader from "react-spinners/FadeLoader";
import ClipLoader from "react-spinners/ClipLoader";

type SpinnerProps = {
  /** Compact loader for buttons and inline UI (does not use the 450px layout). */
  inline?: boolean;
};

const Spinner = ({ inline = false }: SpinnerProps) => {
  if (inline) {
    return (
      <span
        className="sweet-loading sweet-loading--inline"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          flexShrink: 0,
        }}
        aria-hidden
      >
        <ClipLoader
          size={16}
          color="#198754"
          aria-label="Loading"
          data-testid="loader-inline"
        />
      </span>
    );
  }

  return (
    <div
      style={{
        height: "450px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: "0.7",
      }}
      className="sweet-loading"
    >
      <FadeLoader
        cssOverride={{ display: "block", margin: "2px" }}
        color="#198754"
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Spinner;
