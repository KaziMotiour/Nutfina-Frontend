import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { getCart, removeFromCart, updateCartItem, CartItem as BackendCartItem } from "../../store/reducers/orderSlice";
import Link from "next/link";
import QuantitySelector from "../quantity-selector/QuantitySelector";
import Spinner from "../button/Spinner";

const SidebarCart = ({ closeCart, isCartOpen }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartLoading = useSelector((state: RootState) => state.order.loading);
  const [subTotal, setSubTotal] = useState(0);

  // Fetch cart when sidebar opens
  useEffect(() => {
    if (isCartOpen) {
      dispatch(getCart());
    }
  }, [isCartOpen, dispatch]);

  // Transform backend cart items to component format
  const cartItems = useMemo(() => {
    if (!cart || !cart.items || cart.items.length === 0) return [];

    return cart.items.map((item: BackendCartItem) => {
      const variant = item.variant_detail || {};
      const product = (item as any).product_detail || {};
      
      // Get images - prefer variant images, fallback to product images
      const variantImages = variant.images || variant.product_images || [];
      const productImages = product.images || [];
      const images = variantImages.length > 0 ? variantImages : productImages;
      const firstImage = images.find((img: any) => img.is_active) || images[0] || {};

      // Get product name - prefer product name, fallback to variant name
      const title = product.name || variant.name || "Product";

      // Get weight from variant
      const weight = variant.weight_grams 
        ? `${parseFloat(variant.weight_grams.toString())}g` 
        : "";

      return {
        id: item.id,
        variant_id: item.variant,
        title: title,
        newPrice: parseFloat(item.unit_price),
        quantity: item.quantity,
        image: firstImage.image || firstImage.image_url || "/assets/img/common/placeholder.png",
        waight: weight,
        line_total: parseFloat(item.line_total),
      };
    });
  }, [cart]);

  useEffect(() => {
    if (cart) {
      const subtotal = parseFloat(cart.subtotal || "0");
      setSubTotal(subtotal);
    } else {
      setSubTotal(0);
    }
  }, [cart]);

  const total = subTotal;

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleRemoveFromCart = async (item: any) => {
    try {
      // removeFromCart already returns the full cart, so no need to call getCart again
      await dispatch(removeFromCart(item.id)).unwrap();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity is 0 or less, remove the item
      await handleRemoveFromCart({ id: itemId });
      return;
    }

    try {
      // updateCartItem already returns the full cart, so no need to call getCart again
      await dispatch(updateCartItem({ id: itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
    }
  };

  return (
    <>
      {isCartOpen && (
        <div
          style={{ display: isCartOpen ? "block" : "none" }}
          className="gi-side-cart-overlay"
          onClick={closeCart}
        ></div>
      )}
      <div
        id="gi-side-cart"
        className={`gi-side-cart ${isCartOpen ? "gi-open-cart" : ""}`}
      >
        <div className="gi-cart-inner">
          <div className="gi-cart-top">
            <div className="gi-cart-title">
              <span className="cart_title">My Cart</span>
              <Link onClick={closeCart} href="/" className="gi-cart-close">
                <i onClick={handleSubmit} className="fi-rr-cross-small"></i>
              </Link>
            </div>
            {cartLoading ? (
              <div className="gi-pro-content cart-pro-title">
                <Spinner />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="gi-pro-content cart-pro-title">
                Your cart is empty.
              </div>
            ) : (
              <ul className="gi-cart-pro-items">
                {cartItems.map((item: any, index: number) => (
                  <li key={item.id || index}>
                    <Link
                      onClick={handleSubmit}
                      href="/"
                      className="gi-pro-img"
                    >
                      <img src={item.image} alt="product" />
                    </Link>
                    <div className="gi-pro-content">
                      <Link href="/" className="cart-pro-title">
                        {item.title}
                      </Link>
                      <span className="cart-price">
                        {item.waight}{" "}
                        <span>{item.line_total.toFixed(2)} BDT</span>
                      </span>
                      <div className="qty-plus-minus gi-qty-rtl">
                        <QuantitySelector
                          id={item.id}
                          quantity={item.quantity}
                          setQuantity={(newQty: number) => handleQuantityChange(item.id, newQty)}
                        />
                      </div>
                      <Link
                        onClick={() => handleRemoveFromCart(item)}
                        href="#/"
                        className="remove"
                      >
                        ×
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="gi-cart-bottom">
              <div className="cart-sub-total">
                <table className="table cart-table">
                  <tbody>
                    <tr>
                      <td className="text-left">Sub-Total :</td>
                      <td className="text-right">{subTotal.toFixed(2)} BDT</td>
                    </tr>
                    <tr>
                      <td className="text-left">Total :</td>
                      <td className="text-right primary-color">
                        {total.toFixed(2)} BDT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="cart_btn">
                <Link href="/cart" className="gi-btn-1" onClick={closeCart}>
                  View Cart
                </Link>
                <Link href="/checkout" className="gi-btn-2" onClick={closeCart}>
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarCart;
