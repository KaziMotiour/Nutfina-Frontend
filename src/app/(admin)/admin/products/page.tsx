"use client";

export default function AdminProducts() {
  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "10px" }}>
          Products Management
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Manage your products, add new products, edit existing ones, and organize inventory.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <i className="fi-rr-box" style={{ fontSize: "64px", color: "#d1d5db", marginBottom: "20px" }}></i>
        <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "10px" }}>
          Products Management
        </h3>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "30px" }}>
          This section is ready for you to add product management features.
        </p>
        <button
          style={{
            backgroundColor: "#03492f",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#023020";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#03492f";
          }}
        >
          Add New Product
        </button>
      </div>
    </div>
  );
}
