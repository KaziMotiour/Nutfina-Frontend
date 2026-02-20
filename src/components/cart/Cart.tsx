"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import ItemCard from "../product-item/ItemCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { getCart, removeFromCart, updateCartItem, CartItem as BackendCartItem, optimisticUpdateCartItem, rollbackCartItemUpdate } from "../../store/reducers/orderSlice";
import { getRelatedProducts, Product, ProductVariant } from "../../store/reducers/shopSlice";
import { Fade } from "react-awesome-reveal";
import Spinner from "../button/Spinner";
import QuantitySelector from "../quantity-selector/QuantitySelector";
import Link from "next/link";
import { API_BASE_URL } from "../../utils/api";
import category from "@/utility/data/category";


// Helper function to get backend base URL (without /api)
const getBackendBaseUrl = () => {
  const apiUrl = API_BASE_URL || "http://localhost:8000/api";
  // Remove /api from the end if present
  return apiUrl.replace(/\/api$/, "");
};

// Helper function to construct full image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/assets/img/common/placeholder.png";
  
  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // If it's a relative path starting with /, prepend backend base URL
  if (imagePath.startsWith("/")) {
    return `${getBackendBaseUrl()}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend base URL with /
  return `${getBackendBaseUrl()}/${imagePath}`;
};

// Helper function to get image URL from image object (for product/variant images)
const getImageUrlFromObject = (img: any): string => {
  if (!img) return "/assets/img/common/placeholder.png";
  return img.image || img.image_url || "/assets/img/common/placeholder.png";
};

// Helper function to format weight
const formatWeight = (weightGrams: number | null | undefined): string => {
  if (!weightGrams) return "N/A";
  return weightGrams < 1000 
    ? `${weightGrams}g` 
    : `${(weightGrams / 1000).toFixed(1)}kg`;
};


const Cart = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartLoading = useSelector((state: RootState) => state.order.loading);
  const { relatedProducts, loading: productsLoading } = useSelector((state: RootState) => state.shop);

  // Fetch cart on mount only if not already loading and cart doesn't exist
  useEffect(() => {
    if (!cartLoading && !cart) {
      dispatch(getCart()); 
    }
  }, [dispatch, cartLoading, cart]);

  // Track previous cart item IDs to detect actual item changes (not quantity changes)
  const previousItemIdsRef = useRef<Set<number>>(new Set());
  const hasFetchedRef = useRef<boolean>(false);

  // Fetch related products from backend
  // Backend handles: category filtering, excluding cart items, and returning featured if no cart
  // Only fetch when items are added/removed, not when quantities change
  useEffect(() => {
    if (!cart) {
      // If cart is null, fetch related products (backend will return featured products)
      if (!hasFetchedRef.current) {
        dispatch(getRelatedProducts());
        hasFetchedRef.current = true;
      }
      previousItemIdsRef.current = new Set();
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      // If cart is empty, fetch related products (backend will return featured products)
      if (!hasFetchedRef.current) {
        dispatch(getRelatedProducts());
        hasFetchedRef.current = true;
      }
      previousItemIdsRef.current = new Set();
      return;
    }

    // Get current item IDs (not quantities - just IDs to detect add/remove)
    const currentItemIds = new Set(cart.items.map((item: BackendCartItem) => item.id));
    
    // Check if items were added/removed (item IDs changed)
    const itemIdsChanged = 
      currentItemIds.size !== previousItemIdsRef.current.size ||
      Array.from(currentItemIds).some(id => !previousItemIdsRef.current.has(id)) ||
      Array.from(previousItemIdsRef.current).some(id => !currentItemIds.has(id));

    // Only fetch if items were added/removed or this is the first fetch
    if (itemIdsChanged || !hasFetchedRef.current) {
      dispatch(getRelatedProducts());
      previousItemIdsRef.current = currentItemIds;
      hasFetchedRef.current = true;
    }
  }, [cart, dispatch]);

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
      const weight = variant.weight_grams ? formatWeight(parseFloat(variant.weight_grams.toString())) : "N/A";

      // Get image URL - check multiple possible fields and construct full URL
      const imagePath = firstImage.image || firstImage.image_url || firstImage.url;
      const imageUrl = getImageUrl(imagePath);

      return {
        id: item.id,
        variant_id: item.variant,
        title: title,
        newPrice: parseFloat(item.unit_price),
        quantity: item.quantity,
        image: imageUrl,
        line_total: parseFloat(item.line_total),
        weight: weight,
      };
    });
  }, [cart]);


  const handleRemoveFromCart = async (item: any) => {
    try {
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

    // Optimistic update: Update UI immediately
    dispatch(optimisticUpdateCartItem({ id: itemId, quantity: newQuantity }));

    try {
      // Send request to backend (for persistence)
      // Cart is already updated with frontend calculations via optimistic update
      await dispatch(updateCartItem({ id: itemId, quantity: newQuantity })).unwrap();
      // Backend response is ignored - we keep frontend-calculated values
    } catch (error) {
      // Rollback optimistic update if backend request fails
      console.error("Failed to update cart item quantity:", error);
      dispatch(rollbackCartItemUpdate({ id: itemId }));
      // Optionally show an error message to the user
    }
  };

  // Transform backend products to ItemCard format and exclude cart items
  // Transform related products from backend to ItemCard format
  // Backend already handles: category filtering, excluding cart items, and limiting to 10
  const transformedRelatedProducts = useMemo(() => {
    if (!relatedProducts || relatedProducts.length === 0) return [];

    return relatedProducts
      .filter((product: Product) => product.variants && product.variants.length > 0)
      .map((product: Product) => {
        const firstVariant = product.variants![0]; // Safe: already filtered for variants
        
        // Get images - prefer variant images, fallback to product images
        const images = (firstVariant?.images && firstVariant.images.length > 0)
          ? firstVariant.images
          : (firstVariant?.product_images && firstVariant.product_images.length > 0)
          ? firstVariant.product_images
          : product.images || [];

        const firstImage = images?.find((img: any) => img.is_active) || images?.[0];
        const secondImage = images?.find((img: any, idx: number) => idx === 1 && img.is_active) || images?.[1] || firstImage;

        const price = parseFloat(firstVariant.final_price);
        const oldPrice = firstVariant.on_sale ? parseFloat(firstVariant.price) : null;
        const categoryName = product.category_name || 'Uncategorized';
        const weight = formatWeight(firstVariant.weight_grams);

        const options = product.variants?.map((variant: ProductVariant) => ({
          id: variant.id,
          title: variant.name,
          newPrice: variant.final_price,
          oldPrice: variant.price,
          weight: formatWeight(variant.weight_grams),
          sku: variant.sku,
          image: getImageUrlFromObject(variant?.images?.[0] || variant?.product_images?.[0]),
          imageTwo: getImageUrlFromObject(variant?.images?.[1] || variant?.product_images?.[1]),
        }));

        return {
          id: product.id,
          slug: product.slug,
          variant_id: firstVariant.id,
          title: product.name,
          newPrice: price,
          oldPrice: oldPrice || price,
          sale: firstVariant.on_sale ? "Sale" : "",
          image: getImageUrlFromObject(firstImage),
          imageTwo: getImageUrlFromObject(secondImage),
          category: categoryName,
          status: firstVariant.is_active ? "Available" : "Out of Stock",
          rating: 5,
          weight,
          sku: firstVariant.sku || "",
          quantity: 1,
          date: product.created,
          location: "Bangladesh",
          brand: categoryName,
          options,
        };
      });
  }, [relatedProducts]);

  return (
    <>
      <section className="gi-cart-section padding-tb-40">
        <h2 className="d-none">Cart Page</h2>
        <div className="container">
          {cartLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spinner />
            </div>
          ) : cartItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "300",
              }}
              className="gi-pro-content cart-pro-title"
            >
              {" "}
              Add item in a cart.
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="gi-cart-leftside col-lg-10 col-md-12">
                {/* <!-- cart content Start --> */}
                <div className="gi-cart-content" style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <div className="gi-cart-inner">
                    <div className="row">
                      <form action="#">
                        <div className="table-content cart-table-content" style={{ overflowX: "auto" }}>
                          <table className="table gi-table" style={{ marginBottom: 0, width: "100%" }}>
                            <thead style={{ backgroundColor: "#f8f9fa" }}>
                              <tr>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", fontSize: "16px" }}>
                                  Product
                                </th>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "center", fontSize: "16px" }}>
                                  Price
                                </th>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "center", fontSize: "16px" }}>
                                  Weight
                                </th>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "center", fontSize: "16px" }}>
                                  Quantity
                                </th>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "right", fontSize: "16px" }}>
                                  Total
                                </th>
                                <th scope="col" style={{ padding: "20px 15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "center", fontSize: "16px" }}>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {cartItems.map((item: any, index: number) => (
                                <tr 
                                  key={index}
                                  style={{ 
                                    borderBottom: "1px solid #e9ecef",
                                    transition: "background-color 0.2s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <td
                                    data-label="Product"
                                    className="gi-cart-pro-name"
                                    style={{ padding: "20px 15px", verticalAlign: "middle" }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                      <a 
                                        href="/product-left-sidebar"
                                        style={{ 
                                          display: "flex", 
                                          alignItems: "center", 
                                          gap: "15px",
                                          textDecoration: "none",
                                          color: "#333"
                                        }}
                                      >
                                        <img
                                          className="gi-cart-pro-img"
                                          src={item.image}
                                          alt={item.title}
                                          style={{
                                            width: "80px",
                                            height: "80px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                            border: "1px solid #e9ecef"
                                          }}
                                        />
                                        <span style={{ fontWeight: "500", fontSize: "15px" }}>
                                          {item.title}
                                        </span>
                                      </a>
                                    </div>
                                  </td>
                                  <td
                                    data-label="Price"
                                    className="gi-cart-pro-price"
                                    style={{ padding: "20px 15px", textAlign: "center", verticalAlign: "middle" }}
                                  >
                                    <span className="amount" style={{ fontWeight: "500", color: "#333", fontSize: "15px" }}>
                                      {item.newPrice.toFixed(2)} BDT
                                    </span>
                                  </td>
                                  <td
                                    data-label="Weight"
                                    className="gi-cart-pro-weight"
                                    style={{ padding: "20px 15px", textAlign: "center", verticalAlign: "middle" }}
                                  >
                                    <span style={{ fontWeight: "500", color: "#333", fontSize: "15px" }}>
                                      {item.weight}
                                    </span>
                                  </td>
                                  <td
                                    data-label="Quantity"
                                    className="gi-cart-pro-qty"
                                    style={{ padding: "20px 15px", textAlign: "center", verticalAlign: "middle" }}
                                  >
                                    <div 
                                      className="cart-qty-plus-minus qty-plus-minus" 
                                      style={{ 
                                        display: "inline-flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "5px",
                                        overflow: "hidden",
                                        backgroundColor: "#fff"
                                      }}
                                    >
                                      <QuantitySelector
                                        quantity={item.quantity}
                                        id={item.id}
                                        setQuantity={(newQty: number) => handleQuantityChange(item.id, newQty)}
                                      />
                                    </div>
                                  </td>
                                  <td
                                    data-label="Total"
                                    className="gi-cart-pro-subtotal"
                                    style={{ padding: "20px 15px", textAlign: "right", verticalAlign: "middle" }}
                                  >
                                    <span style={{ fontWeight: "600", color: "#333", fontSize: "16px" }}>
                                      {item.line_total.toFixed(2)} BDT
                                    </span>
                                  </td>
                                  <td
                                    onClick={() => handleRemoveFromCart(item)}
                                    data-label="Remove"
                                    className="gi-cart-pro-remove"
                                    style={{ padding: "20px 15px", textAlign: "center", verticalAlign: "middle", cursor: "pointer" }}
                                  >
                                    <a 
                                      href="#"
                                      onClick={(e) => e.preventDefault()}
                                      style={{
                                        display: "inline-block",
                                        width: "40px",
                                        height: "40px",
                                        lineHeight: "40px",
                                        textAlign: "center",
                                        borderRadius: "50%",
                                        backgroundColor: "#fff",
                                        border: "1px solid #e9ecef",
                                        color: "#dc3545",
                                        transition: "all 0.3s ease",
                                        textDecoration: "none"
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#dc3545";
                                        e.currentTarget.style.color = "#fff";
                                        e.currentTarget.style.borderColor = "#dc3545";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#fff";
                                        e.currentTarget.style.color = "#dc3545";
                                        e.currentTarget.style.borderColor = "#e9ecef";
                                      }}
                                    >
                                      <i className="gicon gi-trash-o" style={{ fontSize: "16px" }}></i>
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="row" style={{ marginTop: "30px" }}>
                          <div className="col-lg-12">
                            <div className="gi-cart-update-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                              <Link 
                                href="/"
                                style={{
                                  padding: "12px 30px",
                                  backgroundColor: "#f8f9fa",
                                  color: "#333",
                                  textDecoration: "none",
                                  borderRadius: "5px",
                                  fontWeight: "500",
                                  transition: "all 0.3s ease",
                                  border: "1px solid #e9ecef",
                                  display: "inline-block"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#e9ecef";
                                  e.currentTarget.style.borderColor = "#dee2e6";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                                  e.currentTarget.style.borderColor = "#e9ecef";
                                }}
                              >
                                Continue Shopping
                              </Link>
                              <Link 
                                href="/checkout" 
                                className="gi-btn-2"
                                style={{
                                  padding: "12px 30px",
                                  textDecoration: "none",
                                  borderRadius: "5px",
                                  fontWeight: "500",
                                  transition: "all 0.3s ease",
                                  display: "inline-block"
                                }}
                              >
                                Check Out
                              </Link>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                {/* <!--cart content End --> */}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="gi-new-product padding-tb-40">
        <div className="container">
          <div className="row overflow-hidden m-b-minus-24px">
            <div className="gi-new-prod-section col-lg-12">
              <div className="gi-products">
                <Fade
                  triggerOnce
                  direction="up"
                  duration={2000}
                  delay={200}
                  className="section-title-2"
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  data-aos-delay="200"
                >
                  <div className="section-title-2">
                    <h2 className="gi-title">
                      You May <span>Like</span>
                    </h2>
                    <p>Discover More Products You Might Enjoy</p>
                  </div>
                </Fade>
                <Fade
                  triggerOnce
                  direction="up"
                  duration={2000}
                  delay={200}
                  className="gi-new-block m-minus-lr-12"
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  data-aos-delay="300"
                >
                  <Swiper
                    loop={true}
                    autoplay={{ delay: 1000 }}
                    slidesPerView={5}
                    breakpoints={{
                      0: {
                        slidesPerView: 1,
                      },
                      320: {
                        slidesPerView: 1,
                        spaceBetween: 25,
                      },
                      426: {
                        slidesPerView: 2,
                      },
                      640: {
                        slidesPerView: 2,
                      },
                      768: {
                        slidesPerView: 3,
                      },
                      1024: {
                        slidesPerView: 3,
                      },
                      1025: {
                        slidesPerView: 5,
                      },
                    }}
                    className="deal-slick-carousel gi-product-slider"
                  >
                    {productsLoading ? (
                      <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                        <Spinner />
                      </div>
                    ) : transformedRelatedProducts.length > 0 ? (
                      transformedRelatedProducts.map((item: any, index: number) => (
                        <SwiperSlide key={item.id || index}>
                          <ItemCard data={item} />
                        </SwiperSlide>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                        <p>No related products available</p>
                      </div>
                    )}
                  </Swiper>
                </Fade>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
