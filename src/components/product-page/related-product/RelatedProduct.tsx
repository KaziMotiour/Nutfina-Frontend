"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import ItemCard from "../../product-item/ItemCard";
import FadeComponent from "@/components/animations/FadeComponent";
import Spinner from "@/components/button/Spinner";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getProducts, getProduct, Product, ProductVariant } from "@/store/reducers/shopSlice";

const RelatedProduct = ({
  className = '',
  productId,
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentProduct, products, loading, error } = useSelector(
    (state: RootState) => state.shop
  );

  // Fetch current product if productId is provided and product is not in store
  useEffect(() => {
    if (productId) {
      const productIdNum = Number(productId);
      const isProductInStore = currentProduct && (
        currentProduct.id === productIdNum || 
        currentProduct.slug === productId
      );
      
      if (!isProductInStore) {
        dispatch(getProduct(productId));
      }
    }
  }, [productId, currentProduct, dispatch]);

  // Fetch related products when current product is available
  useEffect(() => {
    if (currentProduct) {
      const categoryId = typeof currentProduct.category === 'object' 
        ? currentProduct.category.id 
        : currentProduct.category;
      
      if (categoryId) {
        dispatch(getProducts({ 
          category: categoryId.toString(), 
          is_active: true 
        }));
      } else {
        // If no category, fetch featured products
        dispatch(getProducts({ 
          is_featured: true, 
          is_active: true 
        }));
      }
    } else if (!productId) {
      // If no productId, show featured products
      dispatch(getProducts({ 
        is_featured: true, 
        is_active: true 
      }));
    }
  }, [currentProduct, dispatch, productId]);

  // Transform backend product data to ItemCard format and filter out current product
  const transformedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter products: must have variants, exclude current product
    const filtered = products.filter((product: Product) => {
      // Only include products that have at least one variant
      const hasVariants = product.variants && product.variants.length > 0;
      if (!hasVariants) return false;
      
      // Exclude current product by ID or slug
      if (currentProduct) {
        return product.id !== currentProduct.id && product.slug !== currentProduct.slug;
      }
      return true;
    });

    // Transform each product to ItemCard format
    return filtered.slice(0, 10).map((product: Product) => {
      // Get the first variant (preferably featured) - variants are already filtered to active by backend
      // But we ensure we have at least one variant (already filtered above)
      const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;
      
      // Safety check: skip if no variant (shouldn't happen due to filter above, but just in case)
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
        id: firstVariant?.id || product.id,
        variant_id: firstVariant?.id || product.id,
        slug: product.slug,
        product_id: product.slug || product.id, // Use slug for product details link
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
    }).filter((item: any) => item !== null); // Remove any null items
  }, [products, currentProduct]);

  const relatedProducts = transformedProducts;

  // Show loading state
  if (loading && relatedProducts.length === 0) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  // Show error state
  if (error && relatedProducts.length === 0) {
    return <div>Failed to load related products</div>;
  }

  // Don't render if no related products
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <section className="gi-related-product gi-new-product padding-tb-40">
        <div className="container">
          <div className="row overflow-hidden m-b-minus-24px">
            <div className="gi-new-prod-section col-lg-12">
              <div className="gi-products">
                <FadeComponent
                  triggerOnce
                  direction="up"
                  duration={2}
                  delay={0.2}
                  distance={50}
                  className="section-title-2"
                >
                  <>
                    <h2 className="gi-title">
                      Related <span>Products</span>
                    </h2>
                    <p>Browse The Collection of Top Products</p>
                  </>
                </FadeComponent>

                <FadeComponent
                  triggerOnce
                  direction="up"
                  duration={2}
                  delay={0.3}
                  distance={50}
                >
                  <div className="gi-new-block m-minus-lr-12">
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
                  </div>
                  
                </FadeComponent>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RelatedProduct;
