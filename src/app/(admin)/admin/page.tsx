"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboardStats } from "@/store/reducers/adminSlice";
import Spinner from "@/components/button/Spinner";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.admin);
  
  


  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: "fi-rr-box",
      color: "#03492f",
      bgColor: "#e8f5e9",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: "fi-rr-shopping-bag",
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "fi-rr-users",
      color: "#f57c00",
      bgColor: "#fff3e0",
    },
    {
      title: "Total Revenue",
      value: `BDT ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: "fi-rr-money",
      color: "#388e3c",
      bgColor: "#e8f5e9",
    },
  ];

  if (loading && !stats) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "20px",
          color: "#991b1b",
        }}
      >
        <p style={{ margin: 0, fontWeight: "500" }}>Error loading dashboard: {error}</p>
        <button
          onClick={() => dispatch(fetchDashboardStats())}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
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
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "10px" }}>
          Dashboard
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Welcome to the admin panel. Manage your store from here.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                    fontWeight: "500",
                  }}
                >
                  {stat.title}
                </p>
                <h3
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  {stat.value}
                </h3>
              </div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  backgroundColor: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className={stat.icon} style={{ fontSize: "24px", color: stat.color }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px" }}>
          Quick Actions
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <a
            href="/admin/products"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#1f2937",
              transition: "all 0.2s ease",
              border: "1px solid #e5e7eb",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#03492f";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.color = "#1f2937";
            }}
          >
            <i className="fi-rr-box" style={{ fontSize: "20px" }}></i>
            <span style={{ fontWeight: "500" }}>Add Product</span>
          </a>
          <a
            href="/admin/orders"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#1f2937",
              transition: "all 0.2s ease",
              border: "1px solid #e5e7eb",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#03492f";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.color = "#1f2937";
            }}
          >
            <i className="fi-rr-shopping-bag" style={{ fontSize: "20px" }}></i>
            <span style={{ fontWeight: "500" }}>View Orders</span>
          </a>
          <a
            href="/admin/users"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#1f2937",
              transition: "all 0.2s ease",
              border: "1px solid #e5e7eb",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#03492f";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.color = "#1f2937";
            }}
          >
            <i className="fi-rr-users" style={{ fontSize: "20px" }}></i>
            <span style={{ fontWeight: "500" }}>Manage Users</span>
          </a>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            marginTop: "30px",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px" }}>
            Recent Orders
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                    Order #
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                    Customer
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                    Amount
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                    Status
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#6b7280" }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any, index: number) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937" }}>
                      {order.order_number || `#${order.id}`}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937" }}>
                      {order.shipping_address?.name || order.user?.email || "Guest"}
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                      BDT {parseFloat(order.total_amount || order.subtotal || "0").toFixed(2)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            order.status === "completed"
                              ? "#d1fae5"
                              : order.status === "pending"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            order.status === "completed"
                              ? "#065f46"
                              : order.status === "pending"
                              ? "#92400e"
                              : "#991b1b",
                        }}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "#6b7280" }}>
                      {new Date(order.created || order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            marginTop: "30px",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "20px" }}>
            Recent Activity
          </h3>
          <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
            No recent orders. This section will show recent orders when available.
          </p>
        </div>
      )}
    </div>
  );
}
