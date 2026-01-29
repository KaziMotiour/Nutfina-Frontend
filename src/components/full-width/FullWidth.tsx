"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ShopProductItem from "../product-item/ShopProductItem";
import { Col, Row } from "react-bootstrap";
import SidebarFilter from "../model/SidebarFilter";
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
  const {
    selectedCategory,
    selectedWeight,
    sortOption,
    minPrice,
    maxPrice,
    range,
    searchTerm,
    selectedColor,
    selectedTags,
  } = useSelector((state: RootState) => state.filter);
  
  // Get products from Redux store
  const { products, loading, error, pagination } = useSelector(
    (state: RootState) => state.shop
  );

  // Prepare API params for fetching products
  const productParams = useMemo(
    () => ({
      is_active: true,
      page: currentPage,
      search: searchTerm || undefined,
      // Add category filter if selected
      ...(selectedCategory.length > 0 && { category: parseInt(selectedCategory[0]) }),
    }),
    [
      currentPage,
      searchTerm,
      selectedCategory,
    ]
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

  // Fetch products when params change
  useEffect(() => {
    dispatch(getProducts(productParams));
  }, [dispatch, productParams]);

  useEffect(() => {
    dispatch(setSearchTerm(""));
    setCurrentPage(1);
  }, [dispatch]);

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

      return {
        id: product.id,
        variant_id: firstVariant?.id || null, // Include variant_id for cart operations
        variant_detail: firstVariant || null, // Include full variant details
        title: product.name,
        newPrice: price,
        oldPrice: oldPrice || price,
        image: getImageUrl(firstImage),
        imageTwo: getImageUrl(secondImage),
        waight: firstVariant?.weight_grams ? `${firstVariant.weight_grams}g` : "",
        date: product.created || "",
        status: product.is_active ? "Available" : "Out Of Stock",
        rating: 4, // Default rating, can be added to backend if needed
        location: "Online",
        brand: categoryName,
        sku: firstVariant?.sku ? parseInt(firstVariant.sku) || product.id : product.id,
        category: categoryName,
        quantity: 1,
        sale: firstVariant?.on_sale ? "Sale" : "",
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
      `}</style>
      <Row>
        <Col
          lg={lg}
          md={2}
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
            <>
              <Spinner />
            </>
          ) : error ? (
            <div
              style={{ textAlign: "center" }}
              className="gi-pro-content cart-pro-title"
            >
              Failed to load products: {error}
            </div>
          ) : (
            <div className={`shop-pro-content`}>
              <div
                className={`shop-pro-inner ${isGridView ? "list-view-50" : ""}`}
              >
                <Row>
                  {transformedProducts.length === 0 ? (
                    <div
                      style={{ textAlign: "center", width: "100%" }}
                      className="gi-pro-content cart-pro-title"
                    >
                      Products not found.
                    </div>
                  ) : (
                    transformedProducts.map((item: any, index: any) => (
                      <ShopProductItem
                        isGridView={isGridView}
                        xl={xl}
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
        <SidebarFilter
          setCurrentPage={setCurrentPage}
          min={minPrice}
          max={maxPrice}
          handlePriceChange={handlePriceChange}
          selectedWeight={selectedWeight}
          selectedCategory={selectedCategory}
          selectedColor={selectedColor}
          selectedTags={selectedTags}
          isFilterOpen={isFilterOpen}
          closeFilter={closeFilter}
        />
      </Row>
    </LoadRowOrContainer>
  );
};

export default FullWidth;
