"use client";
import { useRef, useMemo } from "react";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import ItemCard from "../product-item/ItemCard";
import { Fade } from "react-awesome-reveal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getProducts, Product, ProductVariant } from "../../store/reducers/shopSlice";
import DealendTimer from "../dealend-timer/DealendTimer";
import Spinner from "../button/Spinner";
import { useEffect } from "react";

const Deal = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const { products, loading, error } = useSelector((state: RootState) => state.shop);

  useEffect(() => {
    dispatch(getProducts({ is_featured: true, is_active: true }));
  }, [dispatch]);

  // Transform backend product data to ItemCard format
  const transformedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map((product: Product) => {
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

      const categoryName = product.category_name || 'Uncategorized';

      // Get image URL - the serializer returns full URL in the 'image' field
      const getImageUrl = (img: any) => {
        if (!img) return "/assets/img/common/placeholder.png";
        // The serializer returns full URL in 'image' field
        return img.image || "/assets/img/common/placeholder.png";
      };

      const options = product?.variants?.map((variant: ProductVariant) => {
        return {
          id: variant.id,
          title: variant.name,
          newPrice: variant.final_price,
          oldPrice: variant.price,
          weight: variant.weight_grams ? `${variant.weight_grams}g` : "N/A",
          sku: variant.sku,
          image: getImageUrl(variant?.images?.[0] || variant?.product_images?.[0]),
          imageTwo: getImageUrl(variant?.images?.[1] || variant?.product_images?.[1]),
        }

      })
      return {
        id: firstVariant?.id || product.id,
        title: product.name,
        newPrice: price,
        oldPrice: oldPrice || price,
        sale: firstVariant?.on_sale ? "Sale" : "",
        image: getImageUrl(firstImage),
        imageTwo: getImageUrl(secondImage),
        category: categoryName,
        status: firstVariant?.is_active ? "Available" : "Out of Stock",
        rating: 5, // Default rating, can be added to backend later
        weight: firstVariant?.weight_grams 
          ? `${(firstVariant.weight_grams / 1000).toFixed(1)}kg` 
          : "N/A",
        sku: firstVariant?.sku || product.id,
        quantity: 1,
        date: product.created,
        location: "Bangladesh",
        brand: categoryName,
        waight: firstVariant?.weight_grams 
          ? `${(firstVariant.weight_grams / 1000).toFixed(1)}kg` 
          : "N/A",
        options: options,
      };
    });
  }, [products]);

  if (error) return <div>Failed to load products</div>;
  if (loading || !products)
    return (
      <div>
        <Spinner />
      </div>
    );

  const getData = () => {
    return transformedProducts;
  };

  // Show message if no featured products
  if (transformedProducts.length === 0) {
    return (
      <section className="gi-deal-section padding-tb-40 wow fadeInUp" data-wow-duration="2s">
        <div className="container">
          <Row className="overflow-hidden m-b-minus-24px">
            <Col lg={12} className="gi-deal-section col-lg-12">
              <div className="gi-products">
                <div className="section-title">
                  <div className="section-detail">
                    <h2 className="gi-title">
                      Day of the <span>deal</span>
                    </h2>
                    <p>No featured products available at the moment.</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    );
  }

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  // Check if we have enough items for loop mode
  const hasEnoughItems = transformedProducts.length > 5; // Need more than slidesPerView for loop

  return (
    <>
      <section
        className="gi-deal-section padding-tb-40 wow fadeInUp"
        data-wow-duration="2s"
      >
        <div className="container">
          <Row className="overflow-hidden m-b-minus-24px">
            <Col lg={12} className="gi-deal-section col-lg-12">
              <div className="gi-products">
                <div
                  className="section-title"
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  data-aos-delay="200"
                >
                  <Fade triggerOnce direction="up" duration={2000} delay={200}>
                    <div className="section-detail">
                      <h2 className="gi-title">
                        Day of the <span>deal</span>
                      </h2>
                      <p>Don`t wait. The time will never be just right.</p>
                    </div>
                  </Fade>
                  <DealendTimer />
                </div>
                <Fade
                  triggerOnce
                  direction="up"
                  duration={500}
                  delay={100}
                  className="gi-deal-block m-minus-lr-12"
                >
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider" style={{ position: "relative" }}>
                    <div className="slick-list draggable" style={{ position: "relative" }}>
                      <Swiper
                        onSwiper={(swiper) => {
                          swiperRef.current = swiper;
                        }}
                        modules={[Autoplay]}
                        loop={hasEnoughItems}
                        autoplay={{ 
                          delay: 3000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        slidesPerView={4}
                        spaceBetween={20}
                        breakpoints={{
                          0: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                          },
                          320: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                          },
                          425: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                          },
                          640: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                          },
                          768: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                          },
                          1024: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                          },
                          1200: {
                            slidesPerView: 5,
                            spaceBetween: 20,
                          },
                          1440: {
                            slidesPerView: 5,
                            spaceBetween: 20,
                          },
                        }}
                        className="slick-track"
                        allowTouchMove={true}
                        grabCursor={true}
                      >
                        {getData()?.map((item: any, index: number) => (
                          <SwiperSlide key={item.id} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                    {/* Navigation Buttons - Moved outside Swiper container */}
                    <div className="swiper-buttons" style={{ 
                      position: "absolute", 
                      top: "50%", 
                      left: 0,
                      right: 0,
                      transform: "translateY(-50%)",
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      pointerEvents: "none",
                      zIndex: 10,
                      padding: "0 10px",
                    }}>
                      <button 
                        type="button"
                        ref={prevButtonRef}
                        onClick={handlePrev}
                        style={{
                          pointerEvents: "auto",
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          color: "#333",
                          position: "relative",
                          zIndex: 11,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#5caf90";
                          e.currentTarget.style.borderColor = "#5caf90";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = "#e0e0e0";
                          e.currentTarget.style.color = "#333";
                        }}
                        aria-label="Previous slide"
                      >
                        <i className="fi-rr-angle-small-left" style={{ fontSize: "20px" }}></i>
                      </button>
                      <button 
                        type="button"
                        ref={nextButtonRef}
                        onClick={handleNext}
                        style={{
                          pointerEvents: "auto",
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          color: "#333",
                          position: "relative",
                          zIndex: 11,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#5caf90";
                          e.currentTarget.style.borderColor = "#5caf90";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.borderColor = "#e0e0e0";
                          e.currentTarget.style.color = "#333";
                        }}
                        aria-label="Next slide"
                      >
                        <i className="fi-rr-angle-small-right" style={{ fontSize: "20px" }}></i>
                      </button>
                    </div>
                  </div>
                </Fade>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Deal;
