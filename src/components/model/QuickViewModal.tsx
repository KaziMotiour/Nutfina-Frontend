import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import StarRating from "../stars/StarRating";
import { useDispatch, useSelector } from "react-redux";
import { Fade } from "react-awesome-reveal";
import { Col, Row } from "react-bootstrap";
import QuantitySelector from "../quantity-selector/QuantitySelector";
import { RootState, AppDispatch } from "../../store";
import { showSuccessToast, showErrorToast } from "../toast-popup/Toastify";
import ZoomImage from "@/components/zoom-image/ZoomImage";
import SizeOptions from "../product-item/SizeOptions";
import { addToCart } from "../../store/reducers/orderSlice";
import SidebarCart from "./SidebarCart";
import Link from "next/link";

interface Item {
  id: number;
  title: string;
  newPrice: number;
  waight: string;
  image: string;
  imageTwo: string;
  date: string;
  status: string;
  rating: number;
  oldPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  quantity: number;
}

interface Option {
  id: number;
  value: string;
  tooltip: string;
  oldPrice: number;
  newPrice: number;
}

const QuickViewModal = ({ show, handleClose, data }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartItems = cart?.items || [];
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [options, setOptions] = useState<Option[]>([]);
  const [oldPrice, setOldPrice] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  // Check if item is in cart (by variant_id)
  const isItemInCart = (variantId: number | null) => {
    if (!variantId) return false;
    return cartItems.some((item: any) => item.variant === variantId || item.variant_detail?.id === variantId);
  };

  // Get current quantity in cart for a variant
  const getCartItemQuantity = (variantId: number | null): number => {
    if (!variantId) return 0;
    const cartItem = cartItems.find((item: any) => item.variant === variantId || item.variant_detail?.id === variantId);
    return cartItem ? cartItem.quantity : 0;
  };

  useEffect(() => {
    if (data?.options?.length > 0) {
      const mappedOptions = data.options.map((option: any) => ({
        id: option.id,
        value: option.weight, 
        tooltip: option.weight,
        oldPrice: option.oldPrice || 0,
        newPrice: option.newPrice || 0,
      }));
      
      setOptions(mappedOptions);
      
      // Select the first option initially
      const firstOption = mappedOptions[0];
      if (firstOption) {
        setActiveIndex(firstOption.id);
        setSelectedVariantId(firstOption.id); // Set the selected variant ID
        setNewPrice(firstOption.newPrice || 0);
        setOldPrice(firstOption.oldPrice || 0);
      }
    } else {
      // If no options, use the default price from data and check if variant_id exists
      setOldPrice(data?.oldPrice || 0);
      setNewPrice(data?.newPrice || 0);
      setSelectedVariantId(data?.variant_id || data?.id || null);
    }
  }, [data?.options, data?.oldPrice, data?.newPrice, data?.variant_id, data?.id]);



  const handleCart = async () => {
    // Use the selected variant ID
    const variantId = selectedVariantId;
    
    if (!variantId) {
      showErrorToast("Product variant not found");
      return;
    }

    // Get the current quantity before adding
    const currentQuantity = getCartItemQuantity(variantId);
    const wasInCart = isItemInCart(variantId);

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ variant_id: variantId, quantity: quantity })).unwrap();
      
      // Show appropriate message based on whether item was already in cart
      if (wasInCart) {
        const newQuantity = currentQuantity + quantity;
        showSuccessToast(`Updated! Now you have ${newQuantity} ${newQuantity > 1 ? 'items' : 'item'} in cart`);
      } else {
        showSuccessToast(`Product added to cart successfully! (${quantity} ${quantity > 1 ? 'items' : 'item'})`);
      }
    } catch (error: any) {
      showErrorToast(error || "Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleClick = (id: number) => {
    setActiveIndex(id);
    setSelectedVariantId(id); // Update selected variant ID when weight changes
    const option = options.find((option: any) => option.id === id);
    
    setNewPrice(option?.newPrice || 0);
    setOldPrice(option?.oldPrice || 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <Fade>
      <Modal
        centered
        show={show}
        onHide={handleClose}
        keyboard={false}
        className="modal fade quickview-modal"
        id="gi_quickview_modal"
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog-centered" role="document">
          <div className="modal-content">
            <button
                type="button"
                className="btn-close qty_close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleClose}
            ></button>
            <Modal.Body>
              <Row>
                <Col md={5} sm={12} className=" mb-767">
                  <div className="single-pro-img single-pro-img-no-sidebar">
                    <div className="single-product-scroll">
                      <div className={`single-slide zoom-image-hover`}>
                        <>
                          <ZoomImage src={data.image} alt="" />
                        </>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={7} sm={12}>
                  <div className="quickview-pro-content">
                    <h5 className="gi-quick-title">
                      <a href="/product-left-sidebar">{data.title}</a>
                    </h5>
                    <div className="gi-quickview-rating">
                      <StarRating rating={data.rating} />
                    </div>

                    <div className="gi-quickview-desc">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry`s
                      standard dummy text ever since the 1900s,
                    </div>
                    <div style={{ marginTop: "10px", marginBottom: "15px" }}>
                      <Link 
                        href={`/product-details/${data.slug}`}
                        onClick={handleClose}
                        style={{
                          color: "#5caf90",
                          textDecoration: "none",
                          fontSize: "14px",
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "color 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#4a9d7a";
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#5caf90";
                          e.currentTarget.style.textDecoration = "none";
                        }}
                      >
                        View Full Details
                        <i className="fi-rr-arrow-right" style={{ fontSize: "12px" }}></i>
                      </Link>
                    </div>

                    <div className="gi-quickview-price">
                      <span className="new-price">
                        ${newPrice * quantity}
                      </span>
                      <span className="old-price">${oldPrice}</span>
                    </div>

                    <div className="gi-pro-variation">
                      <div className="gi-pro-variation-inner gi-pro-variation-size gi-pro-size">
                        <div className="gi-pro-variation-content">
                          <SizeOptions
                            categories={[
                              "clothes",
                              "footwear",
                              "vegetables",
                              "accessorise",
                            ]}
                            subCategory={data.category}
                          />
                          <ul className="gi-opt-size">
                            {options.map((data: any, index) => (
                              <li key={index} onClick={() => handleClick(data.id)} className={activeIndex === data.id ? "active" : ""}>
                                <a className="gi-opt-sz" data-tooltip={data.tooltip}>
                                  {data.value}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="gi-quickview-qty">
                      <div 
                        className="qty-plus-minus gi-qty-rtl"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "2px solid #5caf90",
                          borderRadius: "5px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 4px rgba(92, 175, 144, 0.2)",
                          width: "fit-content"
                        }}
                      >
                        <QuantitySelector
                          quantity={quantity}
                          id={data.id}
                          setQuantity={setQuantity}
                        />
                      </div>
                      <div className="gi-quickview-cart ">
                        <button
                          onClick={handleCart}
                          className="gi-btn-1"
                          disabled={isAddingToCart}
                          style={{ opacity: isAddingToCart ? 0.6 : 1 }}
                          title={"Add To Cart"}
                        >
                          <i className="fi-rr-shopping-basket"></i>&nbsp;
                          {isAddingToCart ? 'Adding...' : 'Add To Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Modal.Body>
          </div>
        </div>
      </Modal>
      <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
    </Fade>
  );
};

export default QuickViewModal;
