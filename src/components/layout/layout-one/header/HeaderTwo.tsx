"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import SidebarCart from "../../../model/SidebarCart";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store";
import { logout } from "@/store/reducers/userSlice";
import { setSearchTerm } from "@/store/reducers/filterReducer";
import { getProducts, Product } from "@/store/reducers/shopSlice";

function HeaderTwo({ cartItemCount, wishlistItems }: { cartItemCount: number; wishlistItems: any[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userState = useSelector((state: RootState) => state.user);
  const isAuthenticated = userState?.isAuthenticated ?? false;
  const loading = userState?.loading ?? false;
  const error = userState?.error ?? null;
  const user = userState?.user ?? null;
  
  const { searchTerm } = useSelector((state: RootState) => state.filter);
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.shop);
  
  const [searchInput, setSearchInput] = useState(searchTerm || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search function
  const debounceSearch = useCallback(
    (searchTerm: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(async () => {
        if (searchTerm.trim().length >= 2) {
          try {
            const result = await dispatch(
              getProducts({ search: searchTerm.trim(), is_active: true })
            ).unwrap();
            const productsList = Array.isArray(result) ? result : result?.results || [];
            setSearchResults(productsList.slice(0, 5)); // Limit to 5 results
            setShowDropdown(true);
          } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      }, 300);
    },
    [dispatch]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    debounceSearch(value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowDropdown(false);
    dispatch(setSearchTerm(searchInput));
    router.push("/search-page/?search=" + encodeURIComponent(searchInput));
  };

  const handleProductSelect = (product: Product) => {
    setShowDropdown(false);
    setSearchInput("");
    router.push(`/product-details/${product.slug}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
    } else if (event.key === "ArrowDown" && searchResults.length > 0) {
      event.preventDefault();
      const firstItem = document.querySelector(".search-dropdown-item") as HTMLElement;
      if (firstItem) firstItem.focus();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get product image URL
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      if (image.image_url) return image.image_url;
      if (image.image) {
        return image.image.startsWith("http")
          ? image.image
          : `${process.env.NEXT_PUBLIC_URL || ""}${image.image}`;
      }
    }
    return `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/product/product-1.jpg`;
  };

  // Get product price
  const getProductPrice = (product: Product): string => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      return variant.final_price || variant.price || product.base_price || "0";
    }
    return product.base_price || "0";
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/home");
  };

  return (
    <>
      <div className="gi-header-bottom d-lg-block">
        <div className="container position-relative">
          <div className="row">
            <div className="gi-flex">
              {/* <!-- Header Logo Start --> */}
              <div className="align-self-center gi-header-logo">
                <div className="header-logo">
                  <Link href="/">
                    <img
                      src={
                        process.env.NEXT_PUBLIC_URL +
                        "/assets/img/logo/nutfina-1.png"
                      }
                      alt="Site Logo"
                      // style={{
                      //   width: "%",
                      //   height: "auto",
                      // }}
                    />
                  </Link>
                </div>
              </div>
              {/* <!-- Header Logo End -->
                        <!-- Header Search Start --> */}
              <div className="align-self-center gi-header-search" ref={searchRef}>
                <div className="header-search" style={{ position: "relative" }}>
                  <form
                    onSubmit={handleSubmit}
                    className="gi-search-group-form"
                    action="#"
                  >
                    <input
                      ref={inputRef}
                      className="form-control gi-search-bar"
                      placeholder="Search Products..."
                      type="text"
                      value={searchInput}
                      onChange={handleSearch}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowDropdown(true);
                        }
                      }}
                      autoComplete="off"
                    />
                    <button className="search_submit" type="submit">
                      <i className="fi-rr-search"></i>
                    </button>
                  </form>
                  
                  {/* Search Dropdown */}
                  {showDropdown && searchInput.trim().length >= 2 && (
                    <div
                      className="search-dropdown"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        zIndex: 1000,
                        maxHeight: "400px",
                        overflowY: "auto",
                        marginTop: "4px",
                      }}
                    >
                      {productsLoading ? (
                        <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                          <div style={{ 
                            display: "inline-block",
                            width: "16px",
                            height: "16px",
                            border: "2px solid #e5e7eb",
                            borderTop: "2px solid #5caf90",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite"
                          }}></div>
                          <style dangerouslySetInnerHTML={{__html: `
                            @keyframes spin {
                              0% { transform: rotate(0deg); }
                              100% { transform: rotate(360deg); }
                            }
                          `}} />
                          <span style={{ marginLeft: "8px" }}>Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {searchResults.map((product) => (
                            <div
                              key={product.id}
                              className="search-dropdown-item"
                              onClick={() => handleProductSelect(product)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleProductSelect(product);
                                }
                              }}
                              tabIndex={0}
                              style={{
                                padding: "12px 16px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                borderBottom: "1px solid #f3f4f6",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f9fafb";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fff";
                              }}
                            >
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid #e5e7eb",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/product/product-1.jpg`;
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#1f2937",
                                    marginBottom: "4px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {product.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {product.category_name || "Product"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#5caf90",
                                    marginTop: "4px",
                                  }}
                                >
                                  {parseFloat(getProductPrice(product)).toFixed(2)} BDT
                                </div>
                              </div>
                            </div>
                          ))}
                          <div
                            style={{
                              padding: "12px 16px",
                              borderTop: "1px solid #e5e7eb",
                              backgroundColor: "#f9fafb",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubmit(e as any);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#5caf90",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                                padding: "4px 8px",
                              }}
                            >
                              View all results for &quot;{searchInput}&quot;
                              <i className="fi-rr-arrow-right" style={{ marginLeft: "4px" }}></i>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                          No products found for &quot;{searchInput}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* <!-- Header Search End -->
                        <!-- Header Button Start --> */}
              <div className="gi-header-action align-self-center">
                <div className="gi-header-bottons">
                  {/* <!-- Header User Start --> */}
                  <div className="gi-acc-drop">
                    <Link
                      href=""
                      className="gi-header-btn gi-header-user dropdown-toggle gi-user-toggle gi-header-rtl-btn"
                      title="Account"
                    >
                      <div className="header-icon">
                        <i className="fi-rr-user"></i>
                      </div>
                      <div className="gi-btn-desc">
                        <span className="gi-btn-title">Account</span>
                        <span className="gi-btn-stitle">
                          {" "}
                          {/* {isAuthenticated ? "Logout" : "Login"} */}
                          { isAuthenticated ? user?.full_name || user?.email : "Login" }
                        </span>
                      </div>
                    </Link>
                    <ul className="gi-dropdown-menu">
                      {isAuthenticated ? (
                        <>
                          <li>
                            <Link
                              className="dropdown-item"
                              href="/user-profile"
                            >
                              My Profile
                            </Link>
                          </li>
                          <li>
                             <Link className="dropdown-item" href="/address">
                              Address
                            </Link>
                          </li>
          
                          <li>
                            <Link className="dropdown-item" href="/orders">
                              Orders
                            </Link>
                          </li>
                          <li>
                            <a className="dropdown-item" onClick={handleLogout}>
                              Logout
                            </a>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link className="dropdown-item" href="/register">
                              Register
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" href="/checkout">
                              Checkout
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" href="/track-order">
                              Track Order
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" href="/login">
                              Login
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  {/* <!-- Header User End -->
                                <!-- Header wishlist Start --> */}
                  <Link
                    href="/wishlist"
                    className="gi-header-btn gi-wish-toggle gi-header-rtl-btn"
                    title="Wishlist"
                  >
                    <div className="header-icon">
                      <i className="fi-rr-heart"></i>
                    </div>
                    <div className="gi-btn-desc">
                      <span className="gi-btn-title">Wishlist</span>
                      <span className="gi-btn-stitle">
                        <b className="gi-wishlist-count">
                          {wishlistItems.length}
                        </b>
                        -items
                      </span>
                    </div>
                  </Link>
                  {/* <!-- Header wishlist End -->
                                <!-- Header Cart Start --> */}
                  <Link
                    onClick={openCart}
                    href="#"
                    className="gi-header-btn gi-cart-toggle gi-header-rtl-btn"
                    title="Cart"
                  >
                    <div className="header-icon">
                      <i className="fi-rr-shopping-bag"></i>
                      <span className="main-label-note-new"></span>
                    </div>
                    <div className="gi-btn-desc">
                      <span className="gi-btn-title">Cart</span>
                      <span className="gi-btn-stitle">
                        <b className="gi-cart-count">{cartItemCount}</b>
                        -items
                      </span>
                    </div>
                  </Link>
                  {/* <!-- Header Cart End --> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
    </>
  );
}

export default HeaderTwo;
