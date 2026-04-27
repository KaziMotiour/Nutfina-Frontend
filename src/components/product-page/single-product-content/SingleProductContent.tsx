'use client'
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import QuantitySelector from "../../quantity-selector/QuantitySelector";
import Spinner from "@/components/button/Spinner";
import ZoomImage from "@/components/zoom-image/ZoomImage";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { addToCart } from "@/store/reducers/orderSlice";
import { showSuccessToast, showErrorToast } from "../../toast-popup/Toastify";
import { useRouter } from "next/navigation";
import { createMetaEventId } from "@/components/pixel-setup/utils";

const SingleProductContent = ({
    product,
    onSuccess = () => {},
    hasPaginate = false,
    onError = () => {},
    }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [isSliderInitialized, setIsSliderInitialized] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const cart = useSelector((state: RootState) => state.order.cart);
    const cartItems = cart?.items || [];
    const initialRef: any = null;
    const slider1 = useRef<Slider | null>(initialRef);
    const slider2 = useRef<Slider | null>(initialRef);

    const slider1Settings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        asNavFor: slider2.current,
        focusOnSelect: true,
    };

    const slider2Settings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: slider1.current,
        dots: false,
        arrows: true,
        focusOnSelect: true,
    };

    useEffect(() => {
        setIsSliderInitialized(true);
    }, [isSliderInitialized]);

    const handleSlider1Click = (index: any) => {
        if (slider2.current) {
        slider2.current.slickGoTo(index);
        }
    };

    const handleSlider2Click = (index: any) => {
        if (slider1.current) {
        slider1.current.slickGoTo(index);
        }
    };


    // Transform product data for display
    const productData = useMemo(() => {
        if (!product) return null;

        // Get the first variant or use base product
        const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;

        // Get images - prefer variant images, fallback to product images
        const images = firstVariant?.images && firstVariant.images.length > 0
        ? firstVariant.images
        : firstVariant?.product_images && firstVariant.product_images.length > 0
        ? firstVariant.product_images
        : product.images || [];

        const getImageUrl = (img: any) => {
        if (!img) return "/assets/img/common/placeholder.png";
        const url = img.image_url || img.image;
        return url || "/assets/img/common/placeholder.png";
        };

        // Get price and old price
        const price = firstVariant ? parseFloat(firstVariant.final_price) : parseFloat(product.base_price);
        const oldPrice = firstVariant && firstVariant.on_sale 
        ? parseFloat(firstVariant.price) 
        : null;

        // Ensure images is always an array
        const imageArray = Array.isArray(images) && images.length > 0
        ? images.map((img: any) => ({
            image: getImageUrl(img),
            alt: img.alt_text || "Product Image"
            }))
        : [{ image: "/assets/img/common/placeholder.png" }];

        return {
        id: product.variants[0]?.id,
        productId: product.id,
        title: product.name,
        excerpt: product.excerpt || '',
        price,
        oldPrice,
        images: imageArray,
        variants: Array.isArray(product.variants) ? product.variants : [],
        sku: firstVariant?.sku || product.id,
        status: firstVariant?.is_active ? "IN STOCK" : "OUT OF STOCK",
        category: product.category_name || 'Uncategorized',
        rating: 5, // Default rating
        };
    }, [product]);

    // Set default variant when product loads
    useEffect(() => {
        if (productData && productData.variants.length > 0) {
            // Keep current selection if it still exists after data refresh.
            const stillExists = selectedVariant?.id
                ? productData.variants.some((variant: any) => variant.id === selectedVariant.id)
                : false;
            if (!stillExists) {
                setSelectedVariant(productData.variants[0]);
            }
        } else if (!productData) {
            setSelectedVariant(null);
        }
    }, [productData]);


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

    // Early returns - must be after all hooks
    if (!product) return <div>Failed to load products</div>;
    if (!product)
        return (
        <div>
            <Spinner />
        </div>
        );
    if (!productData) return <div><Spinner /></div>;

    // Event handlers
    const handleAddToCart = async () => {
        if (!selectedVariant) return;
        
        const variantId = selectedVariant.id;
        if (!variantId) {
            showErrorToast("Please select a variant");
            return;
        }

        // Get the current quantity before adding
        const currentQuantity = getCartItemQuantity(variantId);
        const wasInCart = isItemInCart(variantId);

        setIsAddingToCart(true);
        try {
            await dispatch(addToCart({ variant_id: variantId, quantity })).unwrap();
            
            // Show appropriate message based on whether item was already in cart
            if (wasInCart) {
                const newQuantity = currentQuantity + quantity;
                showSuccessToast(`Updated! Now you have ${newQuantity} ${newQuantity > 1 ? 'items' : 'item'} in cart`);
            } else {
                showSuccessToast(`Product added to cart successfully! (${quantity} ${quantity > 1 ? 'items' : 'item'})`);
            }

            const metaEventId = createMetaEventId();

            if (window.fbq) {
                window.fbq('track', 'AddToCart', {
                    content_name: productData?.title,
                    content_type: 'product',
                    value: productData.price * quantity,
                    currency: 'BDT',
                    content_ids: [productData.id],
                    content_category: productData.category,
          
                },{
                    event_id: metaEventId
                });
            }
        } catch (error: any) {
            showErrorToast(error || "Failed to add product to cart");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleVariantSelect = (variant: any) => {
        setSelectedVariant(variant);
    };

    const handleBuyNow = () => {
        const resolvedProductId = product?.id;
        if (!resolvedProductId) {
            showErrorToast("Unable to start buy now. Product not found.");
            return;
        }
        if (!selectedVariant?.id) {
            showErrorToast("Please select a variant first.");
            return;
        }

        const params = new URLSearchParams({
            mode: "buy-now",
            productId: String(resolvedProductId),
            qty: String(Math.max(1, quantity)),
            variantId: String(selectedVariant.id),
            productName: String(productData?.title || product?.name || ""),
        });
        router.push(`/checkout?${params.toString()}`);
    };

    // Get current display values based on selected variant
    const currentPrice = selectedVariant 
        ? parseFloat(selectedVariant.final_price) 
        : productData?.price || 0;
    const currentOldPrice = selectedVariant && selectedVariant.on_sale
        ? parseFloat(selectedVariant.price)
        : productData?.oldPrice || null;
    const currentSku = selectedVariant?.sku || productData?.sku || '';
   

    return (
        <>
        <div className="single-pro-inner">
            <Row>
            <Col className="single-pro-img">
            {isSliderInitialized && (  
                <div className="single-product-scroll">
                    <Slider
                    {...slider1Settings}
                    ref={(slider) => (slider1.current = slider)}
                    className="single-product-cover"
                    >
                    {productData?.images && productData?.images?.map((item: any, index: any) => (
                        <div  
                        key={index}
                        className="single-slide zoom-image-hover"
                        onClick={() => handleSlider1Click(index)}
                        >
                        <ZoomImage
                            src={item.image}
                            alt="" />
                        </div>
                    ))}
                    </Slider>
                    <Slider
                    {...slider2Settings}
                    ref={(slider) => (slider2.current = slider)}
                    className="single-nav-thumb"
                    >
                    {productData?.images && productData?.images?.map((item: any, index: number) => (
                        <div
                        key={index}
                        className="single-slide"
                        onClick={() => handleSlider2Click(index)}
                        >
                        <img className="img-responsive" src={item.image} alt="" />
                        </div>
                    ))}
                    </Slider>
                </div>
            )}
            </Col>
            <Col className="single-pro-desc m-t-991">
                <div className="single-pro-content">
                    <h5 className="gi-single-title">
                        {productData?.title || 'Product'}
                    </h5>
                    {/* <div className="gi-single-rating-wrap">
                        <div className="gi-single-rating">
                        <StarRating rating={productData?.rating || 5} />
                        </div>
                        <span className="gi-read-review">
                        |&nbsp;&nbsp;<a href="#gi-spt-nav-review">Ratings</a>
                        </span>
                    </div> */}

                    <div className="gi-single-price-stoke">
                        <div className="gi-single-price">
                            <div className="final-price">
                                {currentPrice.toFixed(2)} BDT
                                {currentOldPrice && currentOldPrice > currentPrice && (
                                <span className="price-des">
                                    -{Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}%
                                </span>
                                )}
                            </div>
                            {currentOldPrice && currentOldPrice > currentPrice && (
                                <div className="mrp">
                                M.R.P. : <span>{currentOldPrice.toFixed(2)} BDT</span>
                                </div>
                            )}
                            </div>
                        <div className="gi-single-stoke">
                            <span className="gi-single-sku">SKU#: {currentSku}</span>
                            <span className="gi-single-ps-title">{productData?.status || 'OUT OF STOCK'}</span>
                        </div>
                    </div>
                <div className="gi-single-desc">
                    <div dangerouslySetInnerHTML={{ __html: productData?.excerpt || "No description available." }}></div>
                </div>
                            
                {productData?.variants && Array.isArray(productData.variants) && productData.variants.length > 0 && (
                    <div className="gi-pro-variation mt-5">
                        <div className="gi-pro-variation-inner gi-pro-variation-size">
                            <span>Weight</span>
                            <div className="gi-pro-variation-content">
                            <ul>
                                {productData.variants.map((variant: any, index: number) => (
                                <li
                                    key={variant.id || index}
                                    className={selectedVariant?.id === variant.id ? "active" : ""}
                                    onClick={() => handleVariantSelect(variant)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span>
                                    {variant.weight_grams 
                                        ? `${(variant.weight_grams)}g`
                                        : variant.name || variant.sku}
                                    </span>
                                </li>
                                ))}
                            </ul>
                            </div>
                        </div>
                    </div>
                )}
                <div
                    className="gi-single-qty"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "10px",
                    }}
                >
                    <div style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <label style={{ 
                            fontSize: "15px",
                            fontWeight: "500",
                            color: "#333",
                            marginBottom: "0"
                        }}>
                            Quantity:
                        </label>
                        <div className="qty-plus-minus" style={{ 
                            overflow: 'visible', 
                            width: 'auto', 
                            minWidth: '120px',
                            height: '40px', 
                            padding: '0', 
                            display: 'flex', 
                            alignItems: 'center',
                            border: '1px solid #eee',
                            borderRadius: '5px'
                        }}>
                            <QuantitySelector 
                                setQuantity={setQuantity} 
                                quantity={quantity} 
                                id={productData?.id || product?.id} 
                            />
                        </div>
                    </div>
                    <div className="gi-single-cart sticky-cta">
                        <div className="cta-wrapper">
                            <button 
                                className="btn add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                            >
                                <i className="fi-rr-shopping-basket"></i>&nbsp;
                                {isAddingToCart ? 'Adding...' : 'Add To Cart'}
                            </button>

                            <button
                                className="btn buy-now-btn"
                                onClick={handleBuyNow}
                            >
                                <i className="fi-rr-shopping-cart-check"></i>&nbsp;
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </Col>
            </Row>
            <style jsx>{`
                .sticky-cta {
                    margin-top: 10px;
                    padding-top: 20px;
                }

                .cta-wrapper {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .add-to-cart-btn {
                    background: transparent;
                    border: 2px solid #03492f;
                    color: #03492f;
                    font-weight: 600;
                    height: 48px;
                    min-width: 160px;
                    transition: all 0.2s ease;
                }

                .add-to-cart-btn:hover {
                    background: #023020;
                    color: #fff;
                }

                .buy-now-btn {
                    background: #03492f;
                    border: none;
                    color: white;
                    font-weight: 700;
                    height: 52px;
                    min-width: 180px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .buy-now-btn:hover {
                    background: #023020;
                }

                @media (min-width: 992px) {
                      .sticky-cta {
                          position: sticky;
                          bottom: 20px;
                          background: #fff;
                          z-index: 10;
                          padding: 20px 0 0 0;
                          margin-bottom: 50px;  
                      }

                }
                  @media (max-width: 991px) {
                      .sticky-cta {
                          margin-bottom: 50px;
                          margin-top: -0px;
                      }
                  }
`}</style>
        </div>
        </>
    );
};

export default SingleProductContent;
    