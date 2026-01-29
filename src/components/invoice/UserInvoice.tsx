"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getOrder, Order, OrderItem } from "@/store/reducers/orderSlice";
import { PDFContent } from "@/components/pdf-content/PDFContent";
import Spinner from "../button/Spinner";
import Link from "next/link";

interface UserInvoiceProps {
  orderId?: string | number;
  orderNumber?: string;
}

const UserInvoice = ({ orderId, orderNumber }: UserInvoiceProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order?.currentOrder);
  const loading = useSelector((state: RootState) => state.order?.loading ?? false);
  const error = useSelector((state: RootState) => state.order?.error ?? null);

  // Prefer order_number over orderId if both are provided
  // orderId from URL can be either numeric ID or order_number string
  const lookupValue = orderNumber || orderId;

  useEffect(() => {
    if (lookupValue) {
      // Pass as-is (string for order_number like "ORD-20250101-00001", number for ID)
      // getOrder thunk will detect if it's a number or string and use the appropriate endpoint
      dispatch(getOrder(lookupValue));
    }
  }, [dispatch, lookupValue]);

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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  const getItemImage = (item: OrderItem) => {
    // Try variant images first
    if (item.variant_detail?.images && Array.isArray(item.variant_detail.images) && item.variant_detail.images.length > 0) {
      const activeImage = item.variant_detail.images.find((img: any) => img?.is_active !== false);
      const firstImage = activeImage || item.variant_detail.images[0];
      if (firstImage) {
        const imageUrl = firstImage.image || firstImage.image_url || firstImage.url;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
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
          return imageUrl;
        }
      }
    }
    
    return "/assets/img/common/placeholder.png";
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <Spinner />
        <p style={{ marginTop: "20px" }}>Loading invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "red" }}>Error loading invoice: {error || "Order not found"}</p>
        <Link href="/orders" className="gi-btn-1" style={{ marginTop: "20px", display: "inline-block" }}>
          Go Back to Orders
        </Link>
      </div>
    );
  }

  const shippingAddress = order.shipping_address_detail;
  const subtotal = parseFloat(order.subtotal || "0");
  const discount = parseFloat(order.discount || "0");
  const shippingFee = parseFloat(order.shipping_fee || "0");
  const totalAmount = parseFloat(order.total_amount || "0");

  return (
    <>
      <style>{`
        /* Base Styles */
        .invoice-wrapper {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .invoice-info-card {
          background: #f9fafb;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .invoice-info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .invoice-info-row:last-child {
          border-bottom: none;
        }
        
        .invoice-info-label {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        .invoice-info-value {
          color: #1f2937;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
        }
        
        .invoice-mobile-item {
          display: none;
        }
        
        .invoice-mobile-table {
          display: none;
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        
        .invoice-mobile-table th {
          background: #f9fafb;
          padding: 8px 6px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          color: #6b7280;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .invoice-mobile-table th:nth-child(3),
        .invoice-mobile-table th:nth-child(4),
        .invoice-mobile-table th:nth-child(5) {
          text-align: right;
        }
        
        .invoice-mobile-table th:nth-child(3) {
          text-align: center;
        }
        
        .invoice-mobile-table td {
          padding: 6px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 12px;
        }
        
        .invoice-mobile-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        .invoice-mobile-product {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .invoice-mobile-product-img {
          width: 35px;
          height: 35px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }
        
        .invoice-mobile-product-info {
          flex: 1;
          min-width: 0;
        }
        
        .invoice-mobile-product-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 12px;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .invoice-mobile-product-id {
          font-size: 10px;
          color: #9ca3af;
        }
        
        .invoice-mobile-qty {
          display: inline-block;
          padding: 2px 6px;
          background-color: #f3f4f6;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .invoice-mobile-price {
          text-align: right;
          font-weight: 500;
          color: #1f2937;
        }
        
        .invoice-mobile-total {
          text-align: right;
          font-weight: 600;
          color: #1f2937;
        }
        
        /* Mobile devices (up to 768px) */
        @media (max-width: 768px) {
          .invoice-container {
            padding: 20px 16px !important;
          }
          
          .invoice-logo {
            max-width: 140px !important;
          }
          
          .invoice-title {
            font-size: 22px !important;
            margin-top: 16px !important;
            margin-bottom: 8px !important;
          }
          
          .invoice-section-title {
            font-size: 15px !important;
            margin-bottom: 12px !important;
            font-weight: 600;
          }
          
          .invoice-text {
            font-size: 14px !important;
            line-height: 1.6;
          }
          
          .invoice-order-details {
            text-align: left !important;
            margin-top: 24px !important;
          }
          
          .invoice-info-card {
            padding: 14px;
          }
          
          .invoice-info-label,
          .invoice-info-value {
            font-size: 13px;
          }
          
          /* Hide desktop table on mobile */
          .invoice-table-desktop {
            display: none !important;
          }
          
          /* Show mobile compact table */
          .invoice-mobile-table {
            display: table !important;
          }
          
          .invoice-mobile-item {
            display: none !important;
          }
          
          .invoice-summary-card {
            display: block !important;
            background: #f9fafb;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
          }
          
          .invoice-table-desktop tfoot {
            display: none !important;
          }
          
          .invoice-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .invoice-summary-row:last-child {
            border-bottom: none;
            border-top: 2px solid #e5e7eb;
            margin-top: 8px;
            padding-top: 16px;
          }
          
          .invoice-summary-label {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
          
          .invoice-summary-value {
            font-size: 15px;
            color: #1f2937;
            font-weight: 600;
          }
          
          .invoice-summary-row:last-child .invoice-summary-label {
            font-size: 16px;
            font-weight: 700;
          }
          
          .invoice-summary-row:last-child .invoice-summary-value {
            font-size: 20px;
            font-weight: 700;
            color: #5caf90;
          }
          
          .invoice-note {
            background: #eff6ff;
            border-left: 3px solid #3b82f6;
            border-radius: 4px;
            padding: 12px;
            margin-top: 20px;
            font-size: 13px;
            color: #1e40af;
          }
        }
        
        /* Desktop (769px and above) */
        @media (min-width: 769px) {
          .invoice-container {
            padding: 48px 56px !important;
          }
          
          .invoice-mobile-item {
            display: none !important;
          }
          
          .invoice-summary-card {
            display: none !important;
          }
          
          .invoice-table-desktop {
            display: table !important;
          }
          
          .invoice-table-desktop tfoot {
            display: table-footer-group !important;
          }
          
          .invoice-info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 32px;
          }
        }
        
        /* Large desktop (1200px and above) */
        @media (min-width: 1200px) {
          .invoice-container {
            padding: 56px 64px !important;
          }
        }
      `}</style>
      <section className="gi-User-invoice padding-tb-40">
        <div className="container">
          <div className="row mb-minus-24px" style={{ justifyContent: "center" }}>
            <div className="col-lg-8 col-md-10 col-sm-12 mb-24" style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className="gi-vendor-dashboard-card">
                <PDFContent
                  title="Invoice"
                  pageSize="A4"
                  margins="20mm"
                  fileName={`invoice-${order.order_number || order.id}.pdf`}
                  order={order}
                >
                  <div className="invoice-container invoice-wrapper" style={{ padding: "48px 56px" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
                      <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
                        Invoice
                      </h2>
                    </div>


                    {/* Info Section - Desktop Grid / Mobile Stack */}
                    <div className="invoice-info-section">
                      {/* Order Details */}
                      <div className="invoice-order-details">
                        <h3 className="invoice-section-title" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#111827" }}>
                          Order Details
                        </h3>
                        <div className="invoice-info-card">
                          <div className="invoice-info-row">
                            <span className="invoice-info-label">Order Number</span>
                            <span className="invoice-info-value">{order.order_number || `#${order.id}`}</span>
                          </div>
                          <div className="invoice-info-row">
                            <span className="invoice-info-label">Order Date</span>
                            <span className="invoice-info-value">{formatDate(order.placed_at || order.created)}</span>
                          </div>
                          <div className="invoice-info-row">
                            <span className="invoice-info-label">Status</span>
                            <span className="invoice-info-value" style={{ color: "#5caf90", textTransform: "capitalize" }}>
                              {order.status?.replace('_', ' ') || "N/A"}
                            </span>
                          </div>
                          {order.payment?.method && (
                            <div className="invoice-info-row">
                              <span className="invoice-info-label">Payment Method</span>
                              <span className="invoice-info-value">{order.payment.method}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Bill To */}
                      <div>
                        <h3 className="invoice-section-title" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#111827" }}>
                          Bill To
                        </h3>
                        <div className="invoice-info-card">
                          <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#1f2937" }}>
                            {shippingAddress?.name || "N/A"}
                          </div>
                          <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.7" }}>
                            <div style={{ marginBottom: "6px" }}>{shippingAddress?.full_address || "N/A"}</div>
                            <div style={{ marginBottom: "6px" }}>
                              {shippingAddress?.district || "N/A"}
                              {shippingAddress?.postal_code ? `, ${shippingAddress.postal_code}` : ""}
                            </div>
                            <div style={{ marginBottom: "12px" }}>{shippingAddress?.country_name || shippingAddress?.country || "N/A"}</div>
                            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
                              <div style={{ marginBottom: "4px" }}>
                                <span style={{ color: "#6b7280" }}>Phone:</span>{" "}
                                <span style={{ fontWeight: "500", color: "#1f2937" }}>{shippingAddress?.phone || "N/A"}</span>
                              </div>
                              {shippingAddress?.email && (
                                <div>
                                  <span style={{ color: "#6b7280" }}>Email:</span>{" "}
                                  <span style={{ fontWeight: "500", color: "#1f2937" }}>{shippingAddress.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/* Items Section */}
                  <div style={{ marginTop: "24px" }}>
                    <h3 className="invoice-section-title" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#111827" }}>
                      Order Items
                    </h3>
                    
                    {/* Mobile Compact Table */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                        <table className="invoice-mobile-table">
                          <thead>
                            <tr>
                              <th style={{ width: "40%" }}>Product</th>
                              <th style={{ width: "15%", textAlign: "center" }}>Qty</th>
                              <th style={{ width: "22%", textAlign: "right" }}>Price</th>
                              <th style={{ width: "23%", textAlign: "right" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item: OrderItem, index: number) => (
                              <tr key={item.id || index}>
                                <td>
                                  <div className="invoice-mobile-product">
                                    <img
                                      src={getItemImage(item)}
                                      alt={item.product_name || "Product"}
                                      className="invoice-mobile-product-img"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/img/common/placeholder.png";
                                      }}
                                    />
                                    <div className="invoice-mobile-product-info">
                                      <div className="invoice-mobile-product-name">
                                        {item.product_name || "N/A"}
                                      </div>
                                      <div className="invoice-mobile-product-id">
                                        ID: {item.variant || item.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <span className="invoice-mobile-qty">{item.quantity}</span>
                                </td>
                                <td className="invoice-mobile-price">
                                  {formatCurrency(item.unit_price)} BDT
                                </td>
                                <td className="invoice-mobile-total">
                                  {formatCurrency(item.total_price)} BDT
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Desktop Table */}
                    <div className="gi-vendor-card-table mb-minus-24px">
                      <div className="invoice-table-wrapper">
                        <table className="table gi-vender-table invoice-table invoice-table-desktop" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th scope="col" style={{ width: "5%", minWidth: "30px" }}>#</th>
                            <th scope="col" style={{ width: "50%", minWidth: "200px" }}>Product</th>
                            <th scope="col" style={{ width: "15%", minWidth: "60px", textAlign: "center" }}>Qty</th>
                            <th scope="col" style={{ width: "15%", minWidth: "80px", textAlign: "right" }}>Price</th>
                            <th scope="col" style={{ width: "15%", minWidth: "80px", textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item: OrderItem, index: number) => (
                              <tr key={item.id || index} style={{ height: "auto", minHeight: "50px" }}>
                                <td style={{ textAlign: "center", color: "#6b7280", padding: "8px 6px" }}>{index + 1}</td>
                                <td style={{ padding: "8px 6px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <img
                                      src={getItemImage(item)}
                                      alt={item.product_name || "Product"}
                                      className="invoice-product-image"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                        border: "1px solid #e5e7eb",
                                        flexShrink: 0
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/img/common/placeholder.png";
                                      }}
                                    />
                                    <div>
                                      <div style={{ fontWeight: "500", color: "#1f2937", fontSize: "14px" }}>
                                        {item.product_name || "N/A"}
                                      </div>
                                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                                        ID: {item.variant || item.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ textAlign: "center", padding: "8px 6px" }}>
                                  <span style={{ 
                                    display: "inline-block",
                                    padding: "3px 8px",
                                    backgroundColor: "#f3f4f6",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    fontWeight: "500"
                                  }}>
                                    {item.quantity}
                                  </span>
                                </td>
                                <td style={{ textAlign: "right", fontWeight: "500", color: "#1f2937", padding: "8px 6px" }}>
                                  {formatCurrency(item.unit_price)} BDT
                                </td>
                                <td style={{ textAlign: "right", fontWeight: "600", color: "#1f2937", padding: "8px 6px" }}>
                                  {formatCurrency(item.total_price)} BDT
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                                No items found
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="border-none" colSpan={3}>
                              <span></span>
                            </td>
                            <td className="border-color" colSpan={1}>
                              <span>
                                <strong>Sub Total</strong>
                              </span>
                            </td>
                            <td className="border-color" style={{ textAlign: "right", fontWeight: "500" }}>
                              <span>{formatCurrency(subtotal)} BDT</span>
                            </td>
                          </tr>
                          {discount > 0 && (
                            <tr>
                              <td className="border-none" colSpan={3}>
                                <span></span>
                              </td>
                              <td className="border-color" colSpan={1}>
                                <span>
                                  <strong>Discount</strong>
                                  {order.coupon_code && (
                                    <span style={{ fontSize: "12px", display: "block", color: "#6b7280", marginTop: "4px" }}>
                                      ({order.coupon_code})
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="border-color" style={{ textAlign: "right", color: "#10b981", fontWeight: "500" }}>
                                <span>-{formatCurrency(discount)} BDT</span>
                              </td>
                            </tr>
                          )}
                          {shippingFee > 0 && (
                            <tr>
                              <td className="border-none" colSpan={3}>
                                <span></span>
                              </td>
                              <td className="border-color" colSpan={1}>
                                <span>
                                  <strong>Shipping Fee</strong>
                                </span>
                              </td>
                              <td className="border-color" style={{ textAlign: "right", fontWeight: "500" }}>
                                <span>{formatCurrency(shippingFee)} BDT</span>
                              </td>
                            </tr>
                          )}
                          <tr style={{ backgroundColor: "#f9fafb" }} className="invoice-total-row">
                            <td className="border-none m-m15" colSpan={3}>
                              <div style={{ padding: "10px 0", fontSize: "13px", color: "#6b7280" }}>
                                {order.notes || "Thank you for your order!"}
                              </div>
                            </td>
                            <td className="border-color m-m15" colSpan={1} style={{ padding: "15px" }}>
                              <span style={{ fontSize: "16px", fontWeight: "700" }}>
                                <strong>Total</strong>
                              </span>
                            </td>
                            <td className="border-color m-m15 invoice-total-amount" style={{ textAlign: "right", padding: "15px" }}>
                              <span style={{ fontSize: "18px", fontWeight: "700", color: "#5caf90" }}>
                                {formatCurrency(totalAmount)} BDT
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section - Mobile */}
                  <div className="invoice-summary-card">
                    <div className="invoice-summary-row">
                      <span className="invoice-summary-label">Subtotal</span>
                      <span className="invoice-summary-value">{formatCurrency(subtotal)} BDT</span>
                    </div>
                    {discount > 0 && (
                      <div className="invoice-summary-row">
                        <span className="invoice-summary-label">
                          Discount
                          {order.coupon_code && (
                            <span style={{ display: "block", fontSize: "11px", color: "#9ca3af", fontWeight: "400", marginTop: "2px" }}>
                              ({order.coupon_code})
                            </span>
                          )}
                        </span>
                        <span className="invoice-summary-value" style={{ color: "#10b981" }}>
                          -{formatCurrency(discount)} BDT
                        </span>
                      </div>
                    )}
                    {shippingFee > 0 && (
                      <div className="invoice-summary-row">
                        <span className="invoice-summary-label">Shipping Fee</span>
                        <span className="invoice-summary-value">{formatCurrency(shippingFee)} BDT</span>
                      </div>
                    )}
                    <div className="invoice-summary-row">
                      <span className="invoice-summary-label">Total Amount</span>
                      <span className="invoice-summary-value">{formatCurrency(totalAmount)} BDT</span>
                    </div>
                  </div>

                  {/* Note Section */}
                  {(order.notes || true) && (
                    <div className="invoice-note" style={{ 
                      background: "#eff6ff",
                      borderLeft: "3px solid #3b82f6",
                      borderRadius: "4px",
                      padding: "14px",
                      marginTop: "24px",
                      fontSize: "14px",
                      color: "#1e40af",
                      lineHeight: "1.6"
                    }}>
                      <strong>Note:</strong> {order.notes || "Thank you for your order! We appreciate your business."}
                    </div>
                  )}
                  </div>
                </PDFContent>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserInvoice;
