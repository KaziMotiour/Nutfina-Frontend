"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchOrders, updateOrderStatus, setOrderFilters, resetOrderFilters } from "@/store/reducers/adminSlice";
import Spinner from "@/components/button/Spinner";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

// Helper function to get image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/assets/img/common/placeholder.png";
  
  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Get backend base URL
  const backendBaseUrl = API_BASE_URL.replace(/\/api$/, "");
  
  // If it's a relative path starting with /, prepend backend base URL
  if (imagePath.startsWith("/")) {
    return `${backendBaseUrl}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path
  return `${backendBaseUrl}/${imagePath}`;
};

export default function AdminOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.admin);
  const [localSearch, setLocalSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch orders when filters change - all filtering handled by backend
    dispatch(fetchOrders(orders.filters));
  }, [dispatch, orders.filters.status, orders.filters.payment_status, orders.filters.ordering, orders.filters.page, orders.filters.page_size, orders.filters.search]);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setOrderFilters({ [key]: value, page: 1 })); // Reset to page 1 when filter changes
  };

  const handleSearch = () => {
    // Search will be sent to backend - you may need to add search parameter support in backend
    dispatch(setOrderFilters({ search: localSearch, page: 1 }));
  };

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    dispatch(resetOrderFilters());
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setOrderFilters({ page: newPage }));
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    if (confirm(`Are you sure you want to update order status to "${newStatus}"?`)) {
      try {
        await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
        // Refresh orders list
        dispatch(fetchOrders(orders.filters));
      } catch (error) {
        alert("Failed to update order status");
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: "#fef3c7", text: "#92400e" },
      confirmed: { bg: "#dbeafe", text: "#1e40af" },
      processing: { bg: "#e0e7ff", text: "#3730a3" },
      shipped: { bg: "#ddd6fe", text: "#5b21b6" },
      delivered: { bg: "#d1fae5", text: "#065f46" },
      completed: { bg: "#d1fae5", text: "#065f46" },
      cancelled: { bg: "#fee2e2", text: "#991b1b" },
      refunded: { bg: "#fce7f3", text: "#9f1239" },
    };
    return colors[status] || { bg: "#f3f4f6", text: "#374151" };
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: "#fef3c7", text: "#92400e" },
      paid: { bg: "#d1fae5", text: "#065f46" },
      failed: { bg: "#fee2e2", text: "#991b1b" },
      refunded: { bg: "#fce7f3", text: "#9f1239" },
    };
    return colors[status] || { bg: "#f3f4f6", text: "#374151" };
  };

  // All filtering is handled by backend now
  const displayCount = orders.count;
  const totalPages = Math.ceil(orders.count / orders.filters.page_size);

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "10px" }}>
          Orders Management
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          View and manage all customer orders, update order status, and track shipments.
        </p>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          {/* Search */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Search Order Number
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Order number..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#03492f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Order Status
            </label>
            <select
              value={orders.filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Payment Status
            </label>
            <select
              value={orders.filters.payment_status}
              onChange={(e) => handleFilterChange("payment_status", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>
              Sort By
            </label>
            <select
              value={orders.filters.ordering}
              onChange={(e) => handleFilterChange("ordering", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="-created">Newest First</option>
              <option value="created">Oldest First</option>
              <option value="-total_amount">Highest Amount</option>
              <option value="total_amount">Lowest Amount</option>
              <option value="-placed_at">Latest Placed</option>
              <option value="placed_at">Earliest Placed</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(orders.filters.status || orders.filters.payment_status || orders.filters.search) && (
          <button
            onClick={handleClearFilters}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {orders.loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
            <Spinner />
          </div>
        ) : orders.error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            <p>{orders.error}</p>
            <button
              onClick={() => dispatch(fetchOrders(orders.filters))}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#03492f",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : orders.results.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            <i className="fi-rr-shopping-bag" style={{ fontSize: "48px", marginBottom: "15px", display: "block" }}></i>
            <p style={{ fontSize: "16px", fontWeight: "500" }}>No orders found</p>
            <p style={{ fontSize: "14px", marginTop: "5px" }}>
              {orders.filters.status || orders.filters.payment_status || orders.filters.search
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Order #
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Customer
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Items
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Amount
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Order Status
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Payment Status
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Date
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.results.map((order: any) => {
                    const statusColor = getStatusColor(order.status);
                    const paymentColor = getPaymentStatusColor(order.payment_status);
                    const isExpanded = expandedOrders.has(order.id);
                    return (
                      <>
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: "1px solid #f3f4f6",
                            transition: "background-color 0.2s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <td style={{ padding: "16px", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button
                                onClick={() => toggleOrderExpansion(order.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  color: "#6b7280",
                                }}
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <i className={isExpanded ? "fi-rr-angle-down" : "fi-rr-angle-right"} style={{ fontSize: "16px" }}></i>
                              </button>
                              <Link
                                href={`/orders/${order.id}`}
                                style={{ color: "#03492f", textDecoration: "none" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.textDecoration = "underline";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.textDecoration = "none";
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {order.order_number || `#${order.id}`}
                              </Link>
                            </div>
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#1f2937" }}>
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                {order.shipping_address_detail?.name || order.shipping_address?.name || order.user_email || "Guest"}
                              </div>
                              {(order.shipping_address_detail?.phone || order.shipping_address?.phone) && (
                                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                  {order.shipping_address_detail?.phone || order.shipping_address?.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#1f2937" }}>
                            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                            BDT {parseFloat(order.total_amount || order.subtotal || "0").toFixed(2)}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                border: "1px solid #d1d5db",
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                                cursor: "pointer",
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                backgroundColor: paymentColor.bg,
                                color: paymentColor.text,
                                display: "inline-block",
                              }}
                            >
                              {order.payment_status || "pending"}
                            </span>
                          </td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "#6b7280" }}>
                            {new Date(order.created || order.placed_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <Link
                              href={`/orders/${order.id}`}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#03492f",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "500",
                                display: "inline-block",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#023020";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#03492f";
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                        {/* Expanded Order Items Row */}
                        {isExpanded && order.items && order.items.length > 0 && (
                          <tr key={`${order.id}-items`}>
                            <td colSpan={8} style={{ padding: "0", backgroundColor: "#f9fafb" }}>
                              <div style={{ padding: "20px", borderTop: "2px solid #e5e7eb" }}>
                                <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "15px" }}>
                                  Order Items ({order.items.length})
                                </h4>
                                <div style={{ overflowX: "auto" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "8px" }}>
                                    <thead>
                                      <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                          Product
                                        </th>
                                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                          Variant
                                        </th>
                                        <th style={{ padding: "12px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                          Quantity
                                        </th>
                                        <th style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                          Unit Price
                                        </th>
                                        <th style={{ padding: "12px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item: any, itemIndex: number) => {
                                        const productName = item.product_name || item.product_detail?.name || item.variant_detail?.product?.name || "Product";
                                        const variantName = item.variant_detail?.name || item.variant_detail?.weight_grams 
                                          ? `${item.variant_detail.weight_grams}gm`
                                          : "Standard";
                                        // Get product image from various possible sources
                                        const productImageRaw = item.product_detail?.images?.[0]?.image 
                                          || item.product_detail?.images?.[0]?.image_url
                                          || item.variant_detail?.images?.[0]?.image
                                          || item.variant_detail?.images?.[0]?.image_url
                                          || item.variant_detail?.product_images?.[0]?.image
                                          || item.variant_detail?.product_images?.[0]?.image_url
                                          || null;
                                        const productImage = getImageUrl(productImageRaw);
                                        
                                        return (
                                          <tr key={itemIndex} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "12px" }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <img
                                                  src={productImage}
                                                  alt={productName}
                                                  style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    border: "1px solid #e5e7eb",
                                                  }}
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/assets/img/common/placeholder.png";
                                                  }}
                                                />
                                                <div>
                                                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                                                    {productName}
                                                  </div>
                                                  {item.variant_detail?.sku && (
                                                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                                                      SKU: {item.variant_detail.sku}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </td>
                                            <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937" }}>
                                              {variantName}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "center", fontSize: "14px", color: "#1f2937", fontWeight: "500" }}>
                                              {item.quantity}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#1f2937" }}>
                                              BDT {parseFloat(item.unit_price || "0").toFixed(2)}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                                              BDT {parseFloat(item.total_price || "0").toFixed(2)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ backgroundColor: "#f9fafb", borderTop: "2px solid #e5e7eb" }}>
                                        <td colSpan={4} style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                          Subtotal:
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                                          BDT {parseFloat(order.subtotal || "0").toFixed(2)}
                                        </td>
                                      </tr>
                                      {parseFloat(order.discount || "0") > 0 && (
                                        <tr style={{ backgroundColor: "#f9fafb" }}>
                                          <td colSpan={4} style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                            Discount:
                                          </td>
                                          <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#dc2626" }}>
                                            - BDT {parseFloat(order.discount || "0").toFixed(2)}
                                          </td>
                                        </tr>
                                      )}
                                      {parseFloat(order.shipping_fee || "0") > 0 && (
                                        <tr style={{ backgroundColor: "#f9fafb" }}>
                                          <td colSpan={4} style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                            Shipping:
                                          </td>
                                          <td style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                                            BDT {parseFloat(order.shipping_fee || "0").toFixed(2)}
                                          </td>
                                        </tr>
                                      )}
                                      <tr style={{ backgroundColor: "#03492f", color: "#fff" }}>
                                        <td colSpan={4} style={{ padding: "12px", textAlign: "right", fontSize: "15px", fontWeight: "700" }}>
                                          Total:
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "right", fontSize: "15px", fontWeight: "700" }}>
                                          BDT {parseFloat(order.total_amount || "0").toFixed(2)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "20px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  Showing {((orders.filters.page - 1) * orders.filters.page_size) + 1} to{" "}
                  {Math.min(orders.filters.page * orders.filters.page_size, displayCount)} of {displayCount} orders
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => handlePageChange(orders.filters.page - 1)}
                    disabled={orders.filters.page === 1}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: orders.filters.page === 1 ? "#f3f4f6" : "#03492f",
                      color: orders.filters.page === 1 ? "#9ca3af" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: orders.filters.page === 1 ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Previous
                  </button>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (orders.filters.page <= 3) {
                        pageNum = i + 1;
                      } else if (orders.filters.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = orders.filters.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: orders.filters.page === pageNum ? "#03492f" : "#fff",
                            color: orders.filters.page === pageNum ? "#fff" : "#374151",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: orders.filters.page === pageNum ? "600" : "500",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(orders.filters.page + 1)}
                    disabled={orders.filters.page >= totalPages}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: orders.filters.page >= totalPages ? "#f3f4f6" : "#03492f",
                      color: orders.filters.page >= totalPages ? "#9ca3af" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: orders.filters.page >= totalPages ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
