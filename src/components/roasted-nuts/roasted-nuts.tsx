"use client";
import { Col, Row } from "react-bootstrap";
import { Fade } from "react-awesome-reveal";
import Spinner from "../button/Spinner";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getCategory, getProducts, clearProducts, Product, ProductVariant } from "@/store/reducers/shopSlice";
import ItemCard from "../product-item/ItemCard";

const RoastedNuts = () => {
    const dispatch = useDispatch<AppDispatch>();
    
    const { 
        products, 
        loading, 
        error, 
        currentCategory 
    } = useSelector((state: RootState) => state.shop);

    useEffect(() => {
        console.log('products', products);
    }, [products]);

    // Fetch category by slug "roasted-nuts"
    useEffect(() => {
        dispatch(getCategory("roasted-nuts"));
    }, [dispatch]);

    // Fetch products when category is loaded
    useEffect(() => {
        if (currentCategory && currentCategory.id) {
            // Clear existing products to avoid showing products from other categories
            dispatch(clearProducts());
            dispatch(getProducts({ 
                category: currentCategory.slug, 
                is_active: true 
            }));
        }
    }, [currentCategory, dispatch]);


    // Transform backend product data to ItemCard format
    const transformedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        if (!currentCategory || !currentCategory.id) return [];

        // Filter products to only include those from the roasted nuts category
        // This is a safety measure in case other components have fetched products
        const filteredProducts = products.filter((product: Product) => {
            const productCategoryId = typeof product.category === 'object' 
                ? product.category.id 
                : product.category;
            return productCategoryId === currentCategory.id;
        });

        // Filter out products that don't have variants
        const productsWithVariants = filteredProducts.filter((product: Product) => {
            return product.variants && product.variants.length > 0;
        });

        return productsWithVariants.map((product: Product) => {
            // Get the first variant (guaranteed to exist since we filtered)
            const firstVariant = product.variants![0];
            
            // Get images - prefer variant images, fallback to product images
            const images = firstVariant.images && firstVariant.images.length > 0
                ? firstVariant.images
                : firstVariant.product_images && firstVariant.product_images.length > 0
                ? firstVariant.product_images
                : product.images || [];

            const firstImage = images.find((img: any) => img.is_active) || images[0];
            const secondImage = images.find((img: any, idx: number) => idx === 1 && img.is_active) || images[1] || firstImage;

            const price = parseFloat(firstVariant.final_price);
            const oldPrice = firstVariant.on_sale 
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
                };
            });

            return {
                id: product.id, // Use variant ID (guaranteed to exist since we filtered)
                variant_id: firstVariant.id, // Explicitly set variant_id for cart
                product_id: product.id, // Keep product ID for reference
                title: product.name,
                newPrice: price,
                oldPrice: oldPrice || price,
                sale: firstVariant.on_sale ? "Sale" : "",
                image: getImageUrl(firstImage),
                imageTwo: getImageUrl(secondImage),
                category: categoryName,
                status: firstVariant.is_active ? "Available" : "Out of Stock",
                rating: 5, // Default rating, can be added to backend later
                weight: firstVariant.weight_grams 
                    ? (firstVariant.weight_grams < 1000 
                        ? `${firstVariant.weight_grams}g` 
                        : `${(firstVariant.weight_grams / 1000).toFixed(1)}kg`)
                    : "N/A",
                sku: firstVariant.sku,
                quantity: 1,
                date: product.created,
                location: "Bangladesh",
                brand: categoryName,
                waight: firstVariant.weight_grams 
                    ? (firstVariant.weight_grams < 1000 
                        ? `${firstVariant.weight_grams}g` 
                        : `${(firstVariant.weight_grams / 1000).toFixed(1)}kg`)
                    : "N/A",
                options: options,
            };
        });
    }, [products, currentCategory]);

    if (error) return <div>Failed to load products</div>;
    if (loading || !products)
        return (
            <div>
                <Spinner />
            </div>
        );

    return (
        <>
            <section
                className="gi-product-tab gi-products padding-tb-40 wow fadeInUp"
                data-wow-duration="2s"
            >
                <div className="container">
                    <div className="gi-tab-title">
                        <div className="gi-main-title">
                            <div className="section-title">
                                <div className="section-detail">
                                    <h2 className="gi-title">
                                        Roasted Nuts
                                    </h2>
                                    <p>A healthy snack for every one</p> 
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <!-- New Product --> */}
                    <Row className="m-b-minus-24px">
                        <Col lg={12}>
                            <div className="tab-content">
                                <Fade
                                    triggerOnce
                                    duration={400}
                                    className="tab-pane fade show active product-block"
                                >
                                    <Row>
                                        {transformedProducts.length === 0 ? (
                                            <Col lg={12}>
                                                <div className="text-center py-5">
                                                    <p>No roasted nuts products found.</p>
                                                </div>
                                            </Col>
                                        ) : (
                                            transformedProducts.map((item: any, index: number) => (
                                                <Col
                                                    key={item.id || index}
                                                    md={4}
                                                    lg={3}
                                                    xl={2}
                                                    className="col-sm-6 gi-product-box gi-col-4"
                                                >   
                                                    <ItemCard data={item} showAddToCart={true} />
                                                </Col>
                                            ))
                                        )}
                                    </Row>
                                </Fade>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    );
};

export default RoastedNuts;
