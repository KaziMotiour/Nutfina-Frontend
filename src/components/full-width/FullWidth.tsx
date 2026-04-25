"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ShopProductItem from "../product-item/ShopProductItem";
import { Col, Row } from "react-bootstrap";
import Spinner from "../button/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import Paginantion from "../paginantion/Paginantion";
import {
  setRange,
  setSearchTerm,
  setSortOption,
} from "@/store/reducers/filterReducer";
import { getProducts, Product } from "@/store/reducers/shopSlice";
import { useSearchParams } from "next/navigation";

const FullWidth = ({
  xl,
  lg,
  classCol,
  itemsPerPage = 12,
  className = "padding-tb-40",
  onlyRow = false,
}: any) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  
  // Refs to track previous params to prevent duplicate dispatches
  const previousParamsRef = useRef<string>("");
  const isInitialMountRef = useRef(true);
  const previousUrlCategoryRef = useRef<string | null>(null);
  const previousUrlSearchRef = useRef<string | null>(null);
  
  // const {
  //   selectedCategory,
  //   selectedWeight,
  //   sortOption,
  //   minPrice,
  //   maxPrice,
  //   range,
  //   searchTerm,
  //   selectedColor,
  //   selectedTags,
  // } = useSelector((state: RootState) => state.filter);
  
  // Get products from Redux store
  const { products, loading, error, pagination } = useSelector(
    (state: RootState) => state.shop
  );

  // Read category from URL params - use stable values
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");

  // Prepare API params for fetching products - create stable string key for comparison
  const productParamsKey = useMemo(
    () => {
      return JSON.stringify({
        is_active: true,
        page: currentPage,
        search: urlSearch || undefined,
        category: urlCategory || undefined,
      });
    },
    [currentPage, urlCategory, urlSearch]
  );

  // Create params object only when needed
  const productParams = useMemo(
    () => {
      return {
        is_active: true,
        page: currentPage,
        search: urlSearch || undefined,
        ...(urlCategory && { category: urlCategory }),
      };
    },
    [currentPage, urlCategory, urlSearch]
  );

  const handlePriceChange = useCallback(
    (min: number, max: number) => {
      dispatch(setRange({ min, max }));
      setCurrentPage(1);
    },
    [dispatch]
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(setSortOption(event.target.value));
      setCurrentPage(1);
    },
    [dispatch]
  );

  // Initialize search term only once on mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      dispatch(setSearchTerm(""));
      isInitialMountRef.current = false;
    }
  }, [dispatch]);

  // Reset page when URL params change (but not on initial mount)
  useEffect(() => {
    if (!isInitialMountRef.current) {
      const urlParamsChanged = 
        previousUrlCategoryRef.current !== urlCategory ||
        previousUrlSearchRef.current !== urlSearch;
      
      if (urlParamsChanged) {
        previousUrlCategoryRef.current = urlCategory;
        previousUrlSearchRef.current = urlSearch;
        if (currentPage !== 1) {
          setCurrentPage(1);
          // Reset the params ref so the fetch effect will run with page 1
          previousParamsRef.current = "";
        } else {
          // Even if page is already 1, reset params ref to trigger fetch with new URL params
          previousParamsRef.current = "";
        }
      }
    } else {
      // Update refs on initial mount
      previousUrlCategoryRef.current = urlCategory;
      previousUrlSearchRef.current = urlSearch;
    }
  }, [urlCategory, urlSearch, currentPage]);

  // Fetch products when params change - only if params actually changed
  useEffect(() => {
    // Only dispatch if params actually changed
    if (previousParamsRef.current !== productParamsKey) {
      previousParamsRef.current = productParamsKey;
      dispatch(getProducts(productParams));
    }
  }, [productParamsKey, productParams, dispatch]);

  const openFilter = () => {
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  const toggleView = (isGrid: any) => {
    setIsGridView(isGrid);
  };

  // Transform backend product data to ItemCard format
  const transformedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter products to only include those with variants
    const productsWithVariants = products.filter((product: Product) => {
      return product.variants && product.variants.length > 0;
    });

    return productsWithVariants.map((product: Product) => {
      // Get the first variant (preferably featured) - guaranteed to exist due to filter
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      // Safety check: skip if no variant (shouldn't happen due to filter, but just in case)
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

      // Get image URL - the serializer returns full URL in the 'image' field
      const getImageUrl = (img: any) => {
        if (!img) return "/assets/img/common/placeholder.png";
        // The serializer returns full URL in 'image' field
        return img.image || img.image_url || "/assets/img/common/placeholder.png";
      };

      // Map all variants to options for QuickViewModal
      const options = product?.variants?.map((variant: any) => {
        return {
          id: variant.id,
          title: variant.name,
          newPrice: parseFloat(variant.final_price) || parseFloat(variant.price) || 0,
          oldPrice: parseFloat(variant.price) || 0,
          weight: variant.weight_grams 
            ? (variant.weight_grams < 1000 
              ? `${variant.weight_grams}g` 
              : `${(variant.weight_grams / 1000).toFixed(1)}kg`)
            : "N/A",
          sku: variant.sku,
          image: getImageUrl(variant?.images?.[0] || variant?.product_images?.[0]),
          imageTwo: getImageUrl(variant?.images?.[1] || variant?.product_images?.[1]),
        };
      }) || [];

      return {
        id: product.id,
        variant_id: firstVariant?.id || null, // Include variant_id for cart operations
        variant_detail: firstVariant || null, // Include full variant details
        slug: product.slug,
        title: product.name,
        excerpt: product.excerpt,
        newPrice: price,
        oldPrice: oldPrice || price,
        image: getImageUrl(firstImage),
        imageTwo: getImageUrl(secondImage),
        waight: firstVariant?.weight_grams 
          ? (firstVariant.weight_grams < 1000 
            ? `${firstVariant.weight_grams}g` 
            : `${(firstVariant.weight_grams / 1000).toFixed(1)}kg`)
          : "",
        date: product.created || "",
        status: product.is_active ? "Available" : "Out Of Stock",
        rating: 4, // Default rating, can be added to backend if needed
        location: "Online",
        brand: categoryName,
        sku: firstVariant?.sku ? parseInt(firstVariant.sku) || product.id : product.id,
        category: categoryName,
        categorySlug: product.category_slug,
        quantity: 1,
        sale: firstVariant?.on_sale ? "Sale" : "",
        options: options, // Include all variants as options for QuickViewModal
      };
    }).filter((item: any) => item !== null); // Remove any null items
  }, [products]);

  // Calculate pagination info
  const totalItems = pagination?.count || transformedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const LoadRowOrContainer = ({ children, onlyRow, className }: any) => {
    return (
      <>
        {onlyRow ? (
          children
        ) : (
          <section className={`gi-shop ${className}`}>
            <div className="container">{children}</div>
          </section>
        )}
      </>
    );
  };

  return (
    <LoadRowOrContainer onlyRow={onlyRow} className={className}>
      <style jsx>{`
        @media (max-width: 575.98px) {
          .filter-btn-responsive { width: auto !important; }
        }
        @media (min-width: 350px) and (max-width: 420px) {
          :global(.shop-pro-inner .gi-product-box) {
            flex: 0 0 50% !important;
            max-width: 50% !important;
          }
        }
        .fullwidth-message {
          text-align: center;
          padding: 2rem 1.25rem;
          border-radius: 16px;
          margin-top: 1rem;
          background: #f8f6f3;
          border: 1px solid #e8e4de;
        }
        .fullwidth-message--loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2.5rem 1.5rem;
        }
        .fullwidth-message--loading .fullwidth-message__text {
          color: #6b6b6b;
          font-size: 0.95rem;
          margin: 0;
        }
        .fullwidth-message--error .fullwidth-message__icon,
        .fullwidth-message--empty .fullwidth-message__icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 0.75rem;
          border-radius: 50%;
          background: #eee9e2;
          color: #8b7355;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .fullwidth-message--empty {
          width: 100%;
        }
        .fullwidth-message--empty .fullwidth-message__icon {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }
        .fullwidth-message__title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #4a4a4a;
          margin-bottom: 0.35rem;
        }
        .fullwidth-message__text {
          color: #6b6b6b;
          margin-bottom: 1rem;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .fullwidth-message--empty .fullwidth-message__text {
          margin-bottom: 0;
        }
        .fullwidth-message__retry {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: #03492f;
          color: #fff;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .fullwidth-message__retry:hover {
          background: #023020;
          transform: scale(1.02);
        }
      `}</style>
      <Row>
        <Col
          lg={lg}
          className={`margin-b-30 gi-shop-rightside margin-b-30`}
        >
          {/* <!-- Shop Top Start --> */}
          <div className="gi-pro-list-top d-flex">
            <div className="col-md-6 gi-grid-list">
              <div className="gi-gl-btn">
                {/* <button
                  onClick={openFilter}
                  className="grid-btn filter-toggle-icon filter-btn-responsive"
                  style={{ width: "70px" }}
                >
                  <i className="fi fi-rr-filter" style={{ marginRight: "4px" }}></i>
                  <span className="d-none d-sm-inline" >Filter</span>
                </button> */}
                <button
                  className={`grid-btn btn-grid-50 ${
                    !isGridView ? "active" : ""
                  }`}
                  onClick={() => toggleView(false)}
                >
                  <i className="fi fi-rr-apps"></i>
                </button>
                <button
                  className={`grid-btn btn-grid-50 ${
                    isGridView ? "active" : ""
                  }`}
                  onClick={() => toggleView(true)}
                >
                  <i className="fi fi-rr-list"></i>
                </button>
              </div>
            </div>
            <div className="col-md-6 gi-sort-select">
              <div className="gi-select-inner">
                <select
                  name="gi-select"
                  id="gi-select"
                  onChange={handleSortChange}
                >
                  <option defaultValue="" disabled>
                    Sort by
                  </option>
                  <option value="1">Position</option>
                  <option value="2">Relevance</option>
                  <option value="3">Name, A to Z</option>
                  <option value="4">Name, Z to A</option>
                  <option value="5">Price, low to high</option>
                  <option value="6">Price, high to low</option>
                </select>
              </div>
            </div>
          </div>
          {/* <!-- Shop Top End --> */}

          {/* <!-- Shop content Start --> */}

          {loading ? (
            <div className="fullwidth-message fullwidth-message--loading">
              <Spinner />
              <p className="fullwidth-message__text">Fetching products...</p>
            </div>
          ) : error ? (
            <div className="fullwidth-message fullwidth-message--error">
              <div className="fullwidth-message__icon">
                <i className="fi-rr-info" aria-hidden />
              </div>
              <h3 className="fullwidth-message__title">Oops, we hit a snag</h3>
              <p className="fullwidth-message__text">
                Products didn&apos;t load — maybe check your connection? Hit the button below and we&apos;ll try again.
              </p>
              <button
                type="button"
                className="fullwidth-message__retry"
                onClick={() => dispatch(getProducts(productParams))}
              >
                <i className="fi-rr-refresh" /> Give it another shot
              </button>
            </div>
          ) : (
            <div className={`shop-pro-content`}>
              <div
                className={`shop-pro-inner ${isGridView ? "list-view-50" : ""}`}
              >
                <Row>
                  {transformedProducts.length === 0 ? (
                    <div className="fullwidth-message fullwidth-message--empty">
                      <div className="fullwidth-message__icon">
                        <i className="fi-rr-search" aria-hidden />
                      </div>
                      <p className="fullwidth-message__text">No products match right now — try a different search or category.</p>
                    </div>
                  ) : (
                    transformedProducts.map((item: any, index: any) => (
                      <ShopProductItem
                        isGridView={isGridView}
                        xl={xl}
                        lg={lg}
                        classCol={classCol}
                        data={item}
                        key={item.id || index}
                      />
                    ))
                  )}
                </Row>
              </div>
              {/* <!-- Pagination Start --> */}
              {products.length > 0 && (
                <div className="gi-pro-pagination">
                  <span>
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                    {totalItems} item(s)
                  </span>

                  {totalPages > 1 && (
                    <Paginantion
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              )}

              {/* <!-- Pagination End --> */}
            </div>
          )}

          {/* <!--Shop content End --> */}
        </Col>
        {/* <!-- Sidebar Area Start --> */}

      </Row>
    </LoadRowOrContainer>
  );
};

export default FullWidth;
