"use client";
import { RootState, AppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { getOrder, Order, OrderItem } from "@/store/reducers/orderSlice";
import Spinner from "../button/Spinner";
import Link from "next/link";

const ProductOrderDetails = ({ id }: { id: string | number }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const orderId = typeof id === 'string' ? parseInt(id) : id;
  
  const order = useSelector((state: RootState) => state.order?.currentOrder);
  const loading = useSelector((state: RootState) => state.order?.loading ?? false);
  const error = useSelector((state: RootState) => state.order?.error ?? null);
  const isAuthenticated = useSelector((state: RootState) => state.user?.isAuthenticated ?? false);

  useEffect(() => {
    if (isAuthenticated && orderId) {
      dispatch(getOrder(orderId));
    }
  }, [dispatch, orderId, isAuthenticated]);

  // useEffect(() => {
  //   console.log('order');
    
  //   if (order) {
  //     if (order.items && order.items.length > 0) {
  //         console.log("Order items:", order.items);
  //     }
  //   }
  // }, [order]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getItemImage = (item: OrderItem) => {
    // Debug logging
    if (item.variant_detail) {
      console.log("Item variant_detail:", item.variant_detail);
      console.log("Variant images:", item.variant_detail.images);
      console.log("Variant product_images:", item.variant_detail.product_images);
    }
    if (item.product_detail) {
      console.log("Item product_detail:", item.product_detail);
      console.log("Product images:", item.product_detail.images);
    }
    
    // Try variant images first
    if (item.variant_detail?.images && Array.isArray(item.variant_detail.images) && item.variant_detail.images.length > 0) {
      const activeImage = item.variant_detail.images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.variant_detail.images[0];
      
      if (firstImage) {
        // Check multiple possible image URL fields
        const imageUrl = firstImage.image || firstImage.image_url || firstImage.url;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          console.log("Using variant image:", imageUrl);
          return imageUrl;
        }
      }
    }
    
    // Fallback to product images from variant
    if (item.variant_detail?.product_images && Array.isArray(item.variant_detail.product_images) && item.variant_detail.product_images.length > 0) {
      const activeImage = item.variant_detail.product_images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.variant_detail.product_images[0];
      
      if (firstImage) {
        const imageUrl = firstImage.image || firstImage.image_url || firstImage.url;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          console.log("Using variant product image:", imageUrl);
          return imageUrl;
        }
      }
    }
    
    // Fallback to product_detail images
    if (item.product_detail?.images && Array.isArray(item.product_detail.images) && item.product_detail.images.length > 0) {
      const activeImage = item.product_detail.images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.product_detail.images[0];
      
      if (firstImage) {
        const imageUrl = firstImage.image || firstImage.image_url || firstImage.url;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          console.log("Using product_detail image:", imageUrl);
          return imageUrl;
        }
      }
    }
    
    console.log("No image found, using placeholder");
    return "/assets/img/common/placeholder.png";
  };

  const handleBackBtn = () => {
    router.push("/user-history");
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <p>
          Please <Link href="/login">login</Link> or <Link href="/register">register</Link>{" "}
          to view this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <Spinner />
        <p style={{ marginTop: "20px" }}>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>Error loading order: {error || "Order not found"}</p>
        <button onClick={handleBackBtn} className="gi-btn-1" style={{ marginTop: "20px" }}>
          Go Back
        </button>
      </div>
    );
  }

  const shippingAddress = order.shipping_address_detail;

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "#ff9800",
      confirmed: "#2196f3",
      processing: "#2196f3",
      shipped: "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
      refunded: "#f44336",
      completed: "#4caf50",
    };
    return statusColors[status?.toLowerCase()] || "#777";
  };

  const getPaymentStatusColor = (status: string) => {
    return status === "paid" ? "#4caf50" : status === "failed" ? "#f44336" : "#ff9800";
  };

  return (
    <>
      <section className="gi-faq padding-tb-20 gi-wishlist">
        <div className="container">
          <div style={{ marginBottom: "10px" }}>
            <button
              onClick={handleBackBtn}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#5caf90",
                padding: "10px 20px",
                borderRadius: "6px",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4a9d7a";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#5caf90";
              }}
            >
              <i className="fi fi-rs-arrow-left"></i>
              Back to Orders
            </button>
          </div>

          <Row>
            <Col lg={4} md={12} className="mb-4">
              <div 
                className="gi-vendor-dashboard-card"
                style={{
                  height: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div className="gi-vendor-card-header" style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "15px" }}>
                  <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                    <i className="fi fi-rs-marker" style={{ marginRight: "8px", color: "#5caf90" }}></i>
                    Shipping Address
                  </h5>
                </div>
                <div className="gi-vendor-card-body" style={{ padding: "20px" }}>
                  {shippingAddress ? (
                    <div style={{ lineHeight: "2" }}>
                      <div style={{ marginBottom: "12px" }}>
                        <strong style={{ color: "#333", marginRight: "8px" }}>Name:</strong>
                        <span style={{ color: "#666" }}>{shippingAddress.name || "N/A"}</span>
                      </div>
                      {shippingAddress.email && (
                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ color: "#333", marginRight: "8px" }}>Email:</strong>
                          <span style={{ color: "#666" }}>{shippingAddress.email}</span>
                        </div>
                      )}
                      {shippingAddress.phone && (
                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ color: "#333", marginRight: "8px" }}>Phone:</strong>
                          <span style={{ color: "#666" }}>{shippingAddress.phone}</span>
                        </div>
                      )}
                      <div style={{ marginBottom: "12px" }}>
                        <strong style={{ color: "#333", marginRight: "8px" }}>Address:</strong>
                        <span style={{ color: "#666" }}>{shippingAddress.full_address || "N/A"}</span>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <strong style={{ color: "#333", marginRight: "8px" }}>District:</strong>
                        <span style={{ color: "#666" }}>{shippingAddress.district || "N/A"}</span>
                      </div>
                      <div style={{ marginBottom: "12px" }}>
                        <strong style={{ color: "#333", marginRight: "8px" }}>Postal Code:</strong>
                        <span style={{ color: "#666" }}>{shippingAddress.postal_code || "N/A"}</span>
                      </div>
                      <div>
                        <strong style={{ color: "#333", marginRight: "8px" }}>Country:</strong>
                        <span style={{ color: "#666" }}>{shippingAddress.country_name || shippingAddress.country || "N/A"}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                      <i className="fi fi-rs-marker" style={{ fontSize: "24px", marginBottom: "10px", display: "block" }}></i>
                      Address not available
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={8} md={12}>
              <div className="gi-vendor-dashboard-card" style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div className="gi-vendor-card-header" style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "20px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", width: "100%" }}>
                    <div style={{ flex: "0 0 auto" }}>
                      <h5 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#333" }}>
                        Order #{order.order_number}
                      </h5>
                      <div style={{ marginTop: "10px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: getStatusColor(order.status) + "20",
                            color: getStatusColor(order.status),
                          }}
                        >
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: getPaymentStatusColor(order.payment_status) + "20",
                            color: getPaymentStatusColor(order.payment_status),
                          }}
                        >
                          Payment: {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flex: "0 0 auto", marginLeft: "auto", minWidth: "150px" }}>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                        Placed on
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                        {formatDate(order.placed_at)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gi-vendor-card-body" style={{ padding: "0" }}>
                  {order.items && order.items.length > 0 ? (
                    <>
                      <div style={{ overflowX: "auto" }}>
                        <table className="table gi-table" style={{ marginBottom: 0 }}>
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6" }}>#</th>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6" }}>Image</th>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6" }}>Product Name</th>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "center" }}>Quantity</th>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "right" }}>Unit Price</th>
                              <th scope="col" style={{ padding: "15px", fontWeight: "600", color: "#333", borderBottom: "2px solid #dee2e6", textAlign: "right" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item: OrderItem, index: number) => (
                              <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "15px", verticalAlign: "middle", color: "#666" }}>
                                  {index + 1}
                                </td>
                                <td style={{ padding: "15px", verticalAlign: "middle" }}>
                                  <img
                                    src={getItemImage(item)}
                                    alt={item.product_name}
                                    style={{
                                      width: "70px",
                                      height: "70px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                      border: "1px solid #e0e0e0",
                                    }}
                                  />
                                </td>
                                <td style={{ padding: "15px", verticalAlign: "middle" }}>
                                  <div style={{ fontWeight: "500", color: "#333", marginBottom: "5px" }}>
                                    {item.product_name || item.variant_detail?.name || "Product"}
                                  </div>
                                  {item.variant_detail?.sku && (
                                    <div style={{ fontSize: "12px", color: "#999" }}>
                                      SKU: {item.variant_detail.sku}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "center", color: "#666" }}>
                                  {item.quantity}
                                </td>
                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", color: "#666" }}>
                                  ${parseFloat(item.unit_price).toFixed(2)}
                                </td>
                                <td style={{ padding: "15px", verticalAlign: "middle", textAlign: "right", fontWeight: "600", color: "#333" }}>
                                  ${parseFloat(item.total_price).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        padding: "20px", 
                        borderTop: "2px solid #dee2e6",
                        borderRadius: "0 0 8px 8px"
                      }}>
                        <div style={{ maxWidth: "400px", marginLeft: "auto" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingBottom: "10px" }}>
                            <span style={{ color: "#666" }}>Subtotal:</span>
                            <span style={{ fontWeight: "500", color: "#333" }}>${parseFloat(order.subtotal).toFixed(2)}</span>
                          </div>
                          {parseFloat(order.discount) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingBottom: "10px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ color: "#666" }}>
                                  Discount
                                  {order.coupon_code && (
                                    <span style={{ 
                                      marginLeft: "8px", 
                                      fontSize: "12px", 
                                      color: "#5caf90",
                                      fontWeight: "600"
                                    }}>
                                      ({order.coupon_code})
                                    </span>
                                  )}
                                </span>
                                {/* {order.coupon_detail?.description && (
                                  <span style={{ 
                                    fontSize: "11px", 
                                    color: "#999",
                                    marginTop: "2px"
                                  }}>
                                    {order.coupon_detail.description}
                                  </span>
                                )} */}
                              </div>
                              <span style={{ fontWeight: "500", color: "#4caf50" }}>-${parseFloat(order.discount).toFixed(2)}</span>
                            </div>
                          )}
                          {parseFloat(order.shipping_fee) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", paddingBottom: "10px"}}>
                              <span style={{ color: "#666" }}>Shipping Fee:</span>
                              <span style={{ fontWeight: "500", color: "#333" }}>Free</span>
                            </div>
                          )}
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            marginTop: "15px", 
                            paddingTop: "15px", 
                            borderTop: "2px solid #5caf90" 
                          }}>
                            <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Total Amount:</span>
                            <span style={{ fontSize: "20px", fontWeight: "700", color: "#5caf90" }}>
                              ${parseFloat(order.total_amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                      <i className="fi fi-rs-shopping-bag" style={{ fontSize: "48px", color: "#ddd", marginBottom: "15px", display: "block" }}></i>
                      <span style={{ color: "#999", fontSize: "16px" }}>No items in this order</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default ProductOrderDetails;
  