"use client";
import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import ItemCard from "../product-item/ItemCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { getCart, removeFromCart, updateCartItem, CartItem as BackendCartItem } from "../../store/reducers/orderSlice";
import { getProducts, Product } from "../../store/reducers/shopSlice";
import { Fade } from "react-awesome-reveal";
import Spinner from "../button/Spinner";
import QuantitySelector from "../quantity-selector/QuantitySelector";
import Link from "next/link";
import { API_BASE_URL } from "../../utils/api";

const Cart = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartLoading = useSelector((state: RootState) => state.order.loading);
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.shop);

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

  // Fetch cart on mount
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Fetch related products based on cart items' categories
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      // Get unique categories from cart items
      const categories = new Set<number>();
      cart.items.forEach((item: BackendCartItem) => {
        const product = (item as any).product_detail;
        if (product && product.category) {
          const categoryId = typeof product.category === 'object' ? product.category.id : product.category;
          if (categoryId) {
            categories.add(categoryId);
          }
        }
      });

      // Get cart item product IDs to exclude them from related products
      const cartProductIds = new Set(
        cart.items.map((item: BackendCartItem) => {
          const product = (item as any).product_detail;
          return product?.id;
        }).filter(Boolean)
      );

      // Fetch products from the same categories, excluding cart items
      if (categories.size > 0) {
        const categoryArray = Array.from(categories);
        // Fetch products from the first category (or you could fetch from all)
        dispatch(getProducts({ 
          category: categoryArray[0]?.toString(), 
          is_active: true,
          page: 1
        }));
      } else {
        // If no categories, fetch featured products
        dispatch(getProducts({ is_featured: true, is_active: true }));
      }
    } else {
      // If cart is empty, show featured products
      dispatch(getProducts({ is_featured: true, is_active: true }));
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

    try {
      await dispatch(updateCartItem({ id: itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      console.error("Failed to update cart item quantity:", error);
    }
  };

  // Transform backend products to ItemCard format and exclude cart items
  const relatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Get cart product IDs and variant IDs to exclude
    const cartProductIds = new Set<number>();
    const cartVariantIds = new Set<number>();
    
    if (cart?.items && cart.items.length > 0) {
      cart.items.forEach((item: BackendCartItem) => {
        const product = (item as any).product_detail;
        const variant = (item as any).variant_detail;
        
        // Add product ID if available
        if (product?.id) {
          cartProductIds.add(product.id);
        }
        
        // Add variant ID if available
        if (variant?.id) {
          cartVariantIds.add(variant.id);
        }
        
        // Also check if variant has product reference
        if (variant?.product) {
          const variantProductId = typeof variant.product === 'object' ? variant.product.id : variant.product;
          if (variantProductId) {
            cartProductIds.add(variantProductId);
          }
        }
      });
    }

    // Filter out products that are already in cart
    // Check both product ID and if any of its variants are in cart
    const filteredProducts = products.filter((product: Product) => {
      // Exclude if product ID is in cart
      if (cartProductIds.has(product.id)) {
        return false;
      }
      
      // Exclude if any variant of this product is in cart
      if (product.variants && product.variants.length > 0) {
        const hasVariantInCart = product.variants.some((variant: any) => {
          const variantId = typeof variant === 'object' ? variant.id : variant;
          return cartVariantIds.has(variantId);
        });
        if (hasVariantInCart) {
          return false;
        }
      }
      
      return true;
    });

    // Transform and limit to 10 products
    return filteredProducts
      .slice(0, 10)
      .map((product: Product) => {
        // Get the first variant (preferably featured) or use base price
        const firstVariant = product.variants && product.variants.length > 0 
          ? product.variants[0] 
          : null;
        
        // Get images - prefer variant images, fallback to product images
        const images = firstVariant?.images && firstVariant.images.length > 0
          ? firstVariant.images
          : firstVariant?.product_images && firstVariant.product_images.length > 0
          ? firstVariant.product_images
          : product.images || [];

        const firstImage = images.find((img: any) => img.is_active) || images[0];
        const secondImage = images.find((img: any, idx: number) => idx === 1 && img.is_active) || images[1] || firstImage;

        const price = firstVariant ? parseFloat(firstVariant.final_price) : parseFloat(product.base_price);
        const oldPrice = firstVariant && firstVariant.on_sale 
          ? parseFloat(firstVariant.price) 
          : null;

        // Get image URL
        const getImageUrl = (img: any) => {
          if (!img) return "/assets/img/common/placeholder.png";
          const imagePath = img.image || img.image_url || img.url;
          if (!imagePath) return "/assets/img/common/placeholder.png";
          
          if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
          }
          
          const backendBaseUrl = (API_BASE_URL || "http://localhost:8000/api").replace(/\/api$/, "");
          if (imagePath.startsWith("/")) {
            return `${backendBaseUrl}${imagePath}`;
          }
          return `${backendBaseUrl}/${imagePath}`;
        };

        return {
          id: product.id,
          title: product.name,
          slug: product.slug,
          image: getImageUrl(firstImage),
          image2: getImageUrl(secondImage),
          newPrice: price,
          oldPrice: oldPrice,
          category: product.category_name || 'Uncategorized',
        };
      });
  }, [products, cart]);

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
                    ) : relatedProducts.length > 0 ? (
                      relatedProducts.map((item: any, index: number) => (
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
