"use client";
import { useCallback, useEffect } from "react";
import SidebarArea from "../shop-sidebar/sidebar-area/SidebarArea";
import { Swiper, SwiperSlide } from "swiper/react";
import StarRating from "../stars/StarRating";
import ProductTeb from "./product-teb/ProductTeb";
import { Col } from "react-bootstrap";
import SingleProductContent from "./single-product-content/SingleProductContent";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import Spinner from "../button/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  setRange,
  setSelectedCategory,
  setSelectedColor,
  setSelectedTags,
  setSelectedWeight,
} from "@/store/reducers/filterReducer";
import { getProduct } from "@/store/reducers/shopSlice";

const ProductPage = ({
  productId,
  order = "",
  none = "none",
  lg = 12,
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    selectedCategory,
    selectedWeight,
    minPrice,
    maxPrice,
    selectedColor,
    selectedTags,
  } = useSelector((state: RootState) => state.filter);

  // Fetch product details from Redux store
  const { currentProduct, loading: productLoading, error: productError } = useSelector(
    (state: RootState) => state.shop
  );

  // Fetch the product when productId is available
  useEffect(() => {
    if (productId) {
      // The backend uses slug for product lookup
      // If productId is actually an ID, you may need to modify the backend or fetch by ID first
      dispatch(getProduct(productId));
    }
  }, [productId, dispatch]);

  const { data, error } = useSWR("/api/moreitem", fetcher, {
    onSuccess,
    onError,
  });

  const handlePriceChange = useCallback(
    (min: number, max: number) => {
      dispatch(setRange({ min, max }));
    },
    [dispatch]
  );

  // Show loading state if fetching product details
  if (productId && productLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  // Show error if product fetch failed
  if (productId && productError) {
    return <div>Failed to load product: {productError}</div>;
  }

  // Show loading for additional products (only if no productId)
  if (!productId && error) return <div>Failed to load products</div>;
  if (!productId && !data)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <>
      <Col
        lg={lg}
        md={12}
        className={`gi-pro-rightside gi-common-rightside ${order}`}
      >
        {/* <!-- Single product content Start --> */}
        <div className="single-pro-block">
          <SingleProductContent product={currentProduct} />
        </div>
        {/* <!--Single product content End -->
                    <!-- Add More and get discount content Start --> */}
        {/* <div className="single-add-more m-tb-40">
          <Swiper
            loop={true}
            autoplay={{ delay: 1000 }}
            slidesPerView={3}
            spaceBetween={20}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              425: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1025: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
            style={{ overflow: "hidden" }}
            className="gi-add-more-slider owl-carousel"
          >
            {getData().map((item: any, index: number) => (
              <SwiperSlide key={index} className="add-more-item">
                <a href="" className="gi-btn-2">
                  +
                </a>
                <div className="add-more-img">
                  <img src={item.image} alt="product" />
                </div>
                <div className="add-more-info">
                  <h5>{item.title}</h5>
                  <span className="gi-pro-rating">
                    <StarRating rating={item.rating} />
                  </span>
                  <span className="gi-price">
                    <span className="new-price">${item.newPrice}</span>
                    <span className="old-price">${item.oldPrice}</span>
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div> */}

        {/* <!-- Single product tab start --> */}
        <ProductTeb />
        {/* <!-- product details description area end --> */}
      </Col>
      {/* <!-- Sidebar Area Start --> */}

      {/* <SidebarArea
        min={minPrice}
        max={maxPrice}
        handleCategoryChange={handleCategoryChange}
        handleWeightChange={handleWeightChange}
        handleColorChange={handleColorChange}
        handleTagsChange={handleTagsChange}
        handlePriceChange={handlePriceChange}
        selectedCategory={selectedCategory}
        selectedWeight={selectedWeight}
        selectedColor={selectedColor}
        selectedTags={selectedTags}
        none={none}
        order={order}
      /> */}
    </>
  );
};

export default ProductPage;
