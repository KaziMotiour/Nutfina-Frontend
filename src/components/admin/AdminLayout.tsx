"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/reducers/userSlice";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  // Redirect if not authenticated or not superuser
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    
    if (!user.is_superuser) {
      router.push("/home");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Admin menu items - you can add more tabs here
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "fi-rr-apps",
      path: "/admin",
    },
    {
      id: "products",
      label: "Products",
      icon: "fi-rr-box",
      path: "/admin/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: "fi-rr-shopping-bag",
      path: "/admin/orders",
    },
    {
      id: "users",
      label: "Users",
      icon: "fi-rr-users",
      path: "/admin/users",
    },
    {
      id: "categories",
      label: "Categories",
      icon: "fi-rr-folder",
      path: "/admin/categories",
    },
    {
      id: "blogs",
      label: "Blogs",
      icon: "fi-rr-document",
      path: "/admin/blogs",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "fi-rr-settings",
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Don't render if not authenticated or not superuser
  if (!isAuthenticated || !user || !user.is_superuser) {
    return null;
  }

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}
        style={{
          width: sidebarOpen ? "260px" : "80px",
          backgroundColor: "#03492f",
          color: "#fff",
          transition: "width 0.3s ease",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: "auto",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
          }}
        >
          {sidebarOpen && (
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#fff" }}>
              Nutfina Admin
            </h2>
          )}
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "20px",
              padding: "5px",
            }}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            <i className={sidebarOpen ? "fi-rr-angle-left" : "fi-rr-angle-right"}></i>
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.full_name
                    ? `${user?.full_name}`
                    : user?.email || "Admin"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Administrator
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav style={{ padding: "10px 0" }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.id}
                href={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 20px",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <i
                  className={item.icon}
                  style={{
                    fontSize: "18px",
                    minWidth: "24px",
                    textAlign: "center",
                  }}
                ></i>
                {sidebarOpen && (
                  <>
                    <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: "500" }}>
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
          >
            <i className="fi-rr-sign-out-alt" style={{ fontSize: "18px", minWidth: "24px" }}></i>
            {sidebarOpen && <span style={{ marginLeft: "12px" }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "260px" : "80px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            backgroundColor: "#fff",
            padding: "15px 30px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={toggleMobileMenu}
              style={{
                display: "none",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#333",
              }}
              className="mobile-menu-toggle"
            >
              <i className="fi-rr-menu-burger"></i>
            </button>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
              {menuItems.find((item) => pathname === item.path || pathname.startsWith(item.path + "/"))?.label || "Admin Panel"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#03492f",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <i className="fi-rr-home"></i>
              <span>View Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "none",
          }}
          className="mobile-overlay"
        ></div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: ${mobileMenuOpen ? "translateX(0)" : "translateX(-100%)"};
            width: 260px !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .admin-layout > div:last-child {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
