import { useState } from "react";
import Badge from "react-bootstrap/Badge";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { apiCall } from "@/utils/api";

const DiscountCoupon = ({ onDiscountApplied, subtotal = 0 }) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isBtnVisible, setIsBtnVisible] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const handleApplyDiscount = async () => {
    if (couponCode.trim() === "") {
      setErrorMessage("Coupon code cannot be empty");
      setDiscount(0);
      setDiscountAmount(0);
      return;
    }

    if (subtotal <= 0) {
      setErrorMessage("Cart subtotal must be greater than 0");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await apiCall("/orders/coupons/validate/", {
        method: "POST",
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: subtotal.toString(),
        }),
      });
      const data = response

      if (data.valid) {
        const discountAmt = parseFloat(data.discount_amount || 0);
        setDiscount(discountAmt);
        setDiscountAmount(discountAmt);
        setAppliedCoupon(data.coupon);
        setErrorMessage("");
        setIsBtnVisible(false);
        
        // Notify parent component with the discount amount
        onDiscountApplied({
          code: couponCode.trim(),
          discountAmount: discountAmt,
          coupon: data.coupon,
        });
        
        showSuccessToast(data.message || "Coupon applied successfully!");
      } else {
        setDiscount(0);
        setDiscountAmount(0);
        setAppliedCoupon(null);
        setErrorMessage(data.detail || "Invalid coupon code");
        showErrorToast(data.detail || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setDiscount(0);
      setDiscountAmount(0);
      setAppliedCoupon(null);
      setErrorMessage("Failed to validate coupon. Please try again.");
      showErrorToast("Failed to validate coupon. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setDiscountAmount(0);
    setAppliedCoupon(null);
    setIsInputVisible(false);
    setIsBtnVisible(true);
    setErrorMessage("");
    
    // Notify parent component that coupon was removed
    onDiscountApplied({
      code: "",
      discountAmount: 0,
      coupon: null,
    });
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <span className="text-left">Coupon Discount</span>
          {isBtnVisible ? (
            <span style={{ marginLeft: "90px" }} className="text-right">
              <a
                className="gi-checkout-coupon cursor-pointer"
                onClick={() => setIsInputVisible(true)}
              >
                Apply Discount
              </a>
            </span>
          ) : (
            <span style={{ marginLeft: "100px" }} className="text-right">
              -{discountAmount.toFixed(2)} BDT
            </span>
          )}
        </div>
        {isInputVisible && (
          <div className="mt-2">
            {isBtnVisible ? (
              <>
                <input
                  style={{ width: "210px", height: "40px" }}
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleApplyDiscount();
                    }
                  }}
                  placeholder="Enter coupon code"
                  className="border p-2"
                  disabled={isLoading}
                />
                <button
                  style={{ marginLeft: "50px" }}
                  className="ml-2 p-2 bg-blue-500 text-white"
                  onClick={handleApplyDiscount}
                  disabled={isLoading}
                >
                  {isLoading ? "Validating..." : "Apply"}
                </button>
              </>
            ) : (
              <>
                <span style={{ position: "relative" }}>
                  {" "}
                  <Badge bg="success">
                    {couponCode}
                    <a
                      onClick={handleRemoveCoupon}
                      style={{
                        color: "white",
                        position: "absolute",
                        right: "0",
                        top: "0",
                        fontSize: "12px",
                      }}
                      className="gi-select-cancel"
                      href="#"
                    >
                      ×
                    </a>
                  </Badge>
                </span>
              </>
            )}
          </div>
        )}
        {errorMessage && (
          <div className="mt-2" style={{ color: "#dc3545", fontSize: "12px" }}>
            {errorMessage}
          </div>
        )}
        {discount > 0 && (
          <div className="mt-2" style={{ color: "#28a745", fontSize: "12px" }}>
            Coupon applied! You saved {discountAmount.toFixed(2)} BDT
            {appliedCoupon && appliedCoupon.discount_type === "percentage" && (
              <> ({appliedCoupon.discount_value}% off)</>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DiscountCoupon;
