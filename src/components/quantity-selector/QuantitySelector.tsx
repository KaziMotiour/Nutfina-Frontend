import { useDispatch } from "react-redux";
import { updateQuantity } from "../../store/reducers/cartSlice";

const QuantitySelector = ({
  id,
  quantity,
  setQuantity,
}: {
  id: number;
  quantity: number;
  setQuantity?: any;
}) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (operation: "increase" | "decrease") => {
    let newQuantity = quantity;

    if (operation === "increase") {
      newQuantity = quantity + 1;
    } else if (operation === "decrease") {
      newQuantity = quantity - 1;
    }

    if (undefined !== setQuantity) {
      setQuantity(newQuantity);
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  return (
    <div style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      width: "100%",
      borderRadius: "6px",
      border: "1px solid #03492F",
      backgroundColor: "#fff"
    }}>
      <button
        type="button"
        style={{ 
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "14px",
          fontWeight: "500",
          color: "#666",
          backgroundColor: "transparent",
          border: "none",
          borderRight: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "36px",
          transition: "all 0.2s ease",
          lineHeight: "1",
          outline: "none"
        }}
        onClick={() => handleQuantityChange("decrease")}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#333";
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#666";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <i className="fi-rr-minus" style={{ fontSize: "14px" }}></i>
      </button>
      <input
        readOnly
        className="qty-input"
        type="text"
        name="gi-qtybtn"
        value={quantity}
        style={{
          width: "50px",
          textAlign: "center",
          border: "none",
          padding: "8px 4px",
          fontSize: "15px",
          fontWeight: "500",
          outline: "none",
          backgroundColor: "transparent",
          flex: "0 0 auto",
          color: "#333"
        }}
      />
      <button
        type="button"
        style={{ 
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "14px",
          fontWeight: "500",
          color: "#666",
          backgroundColor: "transparent",
          border: "none",
          borderLeft: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "36px",
          transition: "all 0.2s ease",
          lineHeight: "1",
          outline: "none"
        }}
        onClick={() => handleQuantityChange("increase")}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#333";
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#666";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <i className="fi-rr-plus" style={{ fontSize: "14px" }}></i>
      </button>
    </div>
  );
};

export default QuantitySelector;
