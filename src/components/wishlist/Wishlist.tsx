"use client";
import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import ItemCard from "../product-item/ItemCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Fade } from "react-awesome-reveal";
import { Col, Row } from "react-bootstrap";
import Spinner from "../button/Spinner";
import { removeWishlist } from "@/store/reducers/wishlistSlice";
import { addToCart } from "@/store/reducers/orderSlice";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import { getProducts, Product, ProductVariant } from "@/store/reducers/shopSlice";

interface Item {
  id: number;
  variant_id?: number;
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
  category_slug: string;
  quantity: number;
}

const Wishlist = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlist.wishlist
  );
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartItems = cart?.items || [];
  const cartLoading = useSelector((state: RootState) => state.order.loading);
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.shop
  );
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("en-GB")
  );

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-GB"));
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  // Fetch related products based on wishlist items' categories
  useEffect(() => {
    console.log(wishlistItems);
    if (wishlistItems.length > 0) {
      // Get unique categories from wishlist items
      const categories = new Set<string>();
      wishlistItems.forEach((item: Item) => {
        if (item.category && item.category.trim() !== "") {
          categories.add(item.category_slug);
        }
      });
      console.log(categories);
      // If we have categories, fetch products from those categories
      if (categories.size > 0) {
        const categoryArray = Array.from(categories);
        // Fetch products from the first category
        dispatch(getProducts({ 
          category: categoryArray[0], 
          is_active: true,
          page: 1
        }));
      } else {
        // If no categories, fetch featured products
        dispatch(getProducts({ is_featured: true, is_active: true }));
      }
    } else {
      // If wishlist is empty, show featured products
      dispatch(getProducts({ is_featured: true, is_active: true }));
    }
  }, [wishlistItems, dispatch]);

  // Helper function to get variant ID from item
  const getVariantId = (item: Item): number => {
    return item.variant_id || item.id;
  };

  // Check if item is in cart (by variant_id)
  const isItemInCart = (variantId: number) => {
    return cartItems.some((item: any) => item.variant === variantId || item.variant_detail?.id === variantId);
  };

  // Get current quantity in cart for a variant
  const getCartItemQuantity = (variantId: number): number => {
    const cartItem = cartItems.find((item: any) => item.variant === variantId || item.variant_detail?.id === variantId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleRemoveFromwishlist = (id: number) => {
    dispatch(removeWishlist(id));
    showSuccessToast("Item removed from wishlist");
  };

  const handleCart = async (data: Item) => {
    // Get variant_id from data
    // For wishlist items, the id might be the variant_id, or it could be stored as variant_id
    const variantId = data.variant_id || data.id;
    
    if (!variantId) {
      showErrorToast("Product variant not found");
      return;
    }

    // Check if item is already in cart
    if (data.status === "Out Of Stock") {
      showErrorToast("This item is out of stock");
      return;
    }

    // Get the current quantity before adding
    const currentQuantity = getCartItemQuantity(variantId);
    const wasInCart = isItemInCart(variantId);

    setAddingToCart(data.id);

    try {
      // Call the backend to add to cart (adds 1 to existing quantity or creates new item)
      await dispatch(addToCart({ variant_id: variantId, quantity: 1 })).unwrap();
      
      // Show appropriate message based on whether item was already in cart
      if (wasInCart) {
        const newQuantity = currentQuantity + 1;
        showSuccessToast(`Updated! Now you have ${newQuantity} ${newQuantity > 1 ? 'items' : 'item'} in cart`);
      } else {
        showSuccessToast("Product added to cart successfully!");
      }
      
      // Optionally remove from wishlist after adding to cart
      // Uncomment the line below if you want to auto-remove from wishlist after adding to cart
      // dispatch(removeWishlist(data.id));
    } catch (error: any) {
      showErrorToast(error || "Failed to add product to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // Transform backend product data to ItemCard format and filter out wishlist items
  const relatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Get wishlist item IDs to exclude them
    const wishlistItemIds = new Set(
      wishlistItems.map((item: Item) => item.id).filter(Boolean)
    );

    // Filter products: must have variants, exclude wishlist items
    const filtered = products.filter((product: Product) => {
      // Only include products that have at least one variant
      const hasVariants = product.variants && product.variants.length > 0;
      if (!hasVariants) return false;
      
      // Exclude wishlist items by variant ID
      const variantIds = product.variants?.map((v: ProductVariant) => v.id) || [];
      return !variantIds.some((vid: number) => wishlistItemIds.has(vid));
    });

    // Transform each product to ItemCard format
    return filtered.slice(0, 10).map((product: Product) => {
      // Get the first variant (preferably featured)
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      if (!firstVariant) return null;
      
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

      const categoryName = product.category_name || 'Uncategorized';

      // Get image URL
      const getImageUrl = (img: any) => {
        if (!img) return "/assets/img/common/placeholder.png";
        return img.image || img.image_url || "/assets/img/common/placeholder.png";
      };

      return {
        id: firstVariant?.id || product.id,
        variant_id: firstVariant?.id || product.id,
        slug: product.slug,
        product_id: product.slug || product.id,
        title: product.name,
        newPrice: price,
        oldPrice: oldPrice || price,
        sale: firstVariant?.on_sale ? "Sale" : "",
        image: getImageUrl(firstImage),
        imageTwo: getImageUrl(secondImage),
        category: categoryName,
        status: firstVariant?.is_active ? "Available" : "Out of Stock",
        rating: 5,
        weight: firstVariant?.weight_grams 
          ? (firstVariant.weight_grams < 1000 
              ? `${firstVariant.weight_grams}g` 
              : `${(firstVariant.weight_grams / 1000).toFixed(1)}kg`)
          : "N/A",
        waight: firstVariant?.weight_grams 
          ? (firstVariant.weight_grams < 1000 
              ? `${firstVariant.weight_grams}g` 
              : `${(firstVariant.weight_grams / 1000).toFixed(1)}kg`)
          : "N/A",
        sku: firstVariant?.sku || product.id,
        quantity: 1,
        date: product.created,
        location: "Bangladesh",
        brand: categoryName,
      };
    }).filter((item: any) => item !== null);
  }, [products, wishlistItems]);

  return (
    <>
      <section className="gi-faq padding-tb-40 gi-wishlist">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Product <span>Wishlist</span>
            </h2>
            <p>Your product wish is our first priority.</p>
          </div>
          {wishlistItems.length === 0 ? (
            <h4 className="text-center">Your wishlist is empty.</h4>
          ) : (
            <Row>
              <Col md={12}>
                <div className="gi-vendor-dashboard-card">
                  <div className="gi-vendor-card-header">
                    <h5>Wishlist</h5>
                    <div className="gi-header-btn">
                      <a className="gi-btn-2" href="#">
                        Shop Now
                      </a>
                    </div>
                  </div>
                  <div className="gi-vendor-card-body">
                    <div className="gi-vendor-card-table">
                      <table className="table gi-table">
                        <thead>
                          <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Image</th>
                            <th scope="col">Name</th>
                            <th scope="col">Date</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="wish-empt">
                          {wishlistItems.map((data, index) => (
                            <tr key={index} className="pro-gl-content">
                              <td scope="row">
                                <span>{index + 1}</span>
                              </td>
                              <td>
                                <img
                                  className="prod-img"
                                  src={data.image}
                                  alt="product image"
                                />
                              </td>
                              <td>
                                <span>{data.title}</span>
                              </td>
                              <td>
                                <span>{currentDate}</span>
                              </td>
                              <td>
                                <span>${data.newPrice}</span>
                              </td>
                              <td>
                                <span
                                  className={
                                    data.status === "Available" ? "avl" : "out"
                                  }
                                >
                                  {data.status}
                                </span>
                              </td>
                              <td>
                                <span className="tbl-btn">
                                  <a
                                    className={`gi-btn-2 add-to-cart ${
                                      addingToCart === data.id || data.status === "Out Of Stock"
                                        ? "disabled"
                                        : ""
                                    }`}
                                    title={
                                      data.status === "Out Of Stock"
                                        ? "Out of Stock"
                                        : isItemInCart(getVariantId(data))
                                        ? `Update Cart (${getCartItemQuantity(getVariantId(data))} in cart)`
                                        : "Add To Cart"
                                    }
                                    onClick={() => {
                                      if (data.status !== "Out Of Stock" && addingToCart !== data.id) {
                                        handleCart(data);
                                      }
                                    }}
                                    style={{
                                      cursor:
                                        addingToCart === data.id || data.status === "Out Of Stock"
                                          ? "not-allowed"
                                          : "pointer",
                                      opacity:
                                        addingToCart === data.id || data.status === "Out Of Stock"
                                          ? 0.6
                                          : 1,
                                    }}
                                  >
                                    {addingToCart === data.id ? (
                                      <i className="fi-rr-spinner"></i>
                                    ) : isItemInCart(getVariantId(data)) ? (
                                      <>
                                        <i className="fi-rr-shopping-basket"></i>
                                        <span style={{ 
                                          fontSize: "10px", 
                                          marginLeft: "3px",
                                          fontWeight: "bold" 
                                        }}>
                                          +
                                        </span>
                                      </>
                                    ) : (
                                      <i className="fi-rr-shopping-basket"></i>
                                    )}
                                  </a>
                                  <a
                                    onClick={() =>
                                      handleRemoveFromwishlist(data.id)
                                    }
                                    className="gi-btn-1 gi-remove-wish btn"
                                    href="#"
                                    title="Remove From List"
                                  >
                                    ×
                                  </a>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </section>
      <section className="gi-new-product padding-tb-40">
        <div className="container">
          <Row className="overflow-hidden m-b-minus-24px">
            <Col lg={12} className="gi-new-prod-section">
              <div className="gi-products">
                <Fade
                  triggerOnce
                  direction="up"
                  duration={2000}
                  delay={200}
                  className="section-title-2"
                >
                  <h2 className="gi-title">
                    You May<span> also like</span>
                  </h2>
                  <p>Browse The Collection of Top Products</p>
                </Fade>
                {productsLoading && relatedProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spinner />
                  </div>
                ) : relatedProducts.length > 0 ? (
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
                      loop={relatedProducts.length > 5}
                      autoplay={{ delay: 1000 }}
                      slidesPerView={5}
                      breakpoints={{
                        0: {
                          slidesPerView: 1,
                        },
                        320: {
                          slidesPerView: 1,
                        },
                        425: {
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
                      {relatedProducts.map((item: any, index: number) => (
                        <SwiperSlide key={item.id || index}>
                          <ItemCard data={item} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </Fade>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <p className="text-muted">No related products found.</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Wishlist;
