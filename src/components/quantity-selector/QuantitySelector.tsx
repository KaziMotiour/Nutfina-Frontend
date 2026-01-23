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
    <div style={{ display: "inline-flex", alignItems: "center", width: "100%" }}>
      <div
        style={{ 
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "18px",
          fontWeight: "600",
          color: "#333",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #dee2e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "35px",
          transition: "background-color 0.2s ease",
          lineHeight: "1"
        }}
        onClick={() => handleQuantityChange("decrease")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e9ecef";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }}
      >
        <i className="fi-rr-minus" style={{ fontSize: "16px", display: "inline-block", lineHeight: "1", verticalAlign: "middle" }}></i>
      </div>
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
          padding: "8px 5px",
          fontSize: "15px",
          fontWeight: "500",
          outline: "none",
          backgroundColor: "#fff",
          flex: "0 0 auto"
        }}
      />
      <div
        style={{ 
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "18px",
          fontWeight: "600",
          color: "#333",
          backgroundColor: "#f8f9fa",
          borderLeft: "1px solid #dee2e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "35px",
          transition: "background-color 0.2s ease",
          lineHeight: "1"
        }}
        onClick={() => handleQuantityChange("increase")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e9ecef";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }}
      >
        <i className="fi-rr-plus" style={{ fontSize: "16px", display: "inline-block", lineHeight: "1", verticalAlign: "middle" }}></i>
      </div>
    </div>
  );
};

export default QuantitySelector;
