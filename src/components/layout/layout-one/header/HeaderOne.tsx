"use client";

import Link from "next/link";
import { useState } from "react";
import SidebarCart from "../../../model/SidebarCart";
import MobileManuSidebar from "../../../model/MobileManuSidebar";
import Dropdown from "react-bootstrap/Dropdown";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

function HeaderOne({ cartItemCount, wishlistItems }: { cartItemCount: number; wishlistItems: any[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = useSelector(
    (state: RootState) => state.user?.isAuthenticated ?? false
  );

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const toggleMainMenu = (menuKey: any) => {
    setActiveMainMenu((prevMenu) => (prevMenu === menuKey ? null : menuKey));
  };

  const openMobileManu = () => {
    setIsMobileMenuOpen((prev: any) => !prev);
  }

  const closeMobileManu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <style jsx>{`
        :global(.mobile-user-dropdown .dropdown-menu) {
          min-width: 190px;
          border: 1px solid #eef1ee;
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 10px 26px rgba(19, 33, 26, 0.12);
          margin-top: 10px;
        }
        :global(.mobile-user-dropdown .dropdown-item.mobile-user-item) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #2e3a33;
        }
        :global(.mobile-user-dropdown .dropdown-item.mobile-user-item i) {
          color: #5caf90;
          font-size: 14px;
          line-height: 1;
        }
        :global(.mobile-user-dropdown .dropdown-item.mobile-user-item:hover),
        :global(.mobile-user-dropdown .dropdown-item.mobile-user-item:focus) {
          background-color: #f3fbf7;
          color: #1f6f52;
        }
      `}</style>
      <div className="header-top">
        <div className="container">
          <div className="row align-itegi-center">
            {/* <!-- Header Top Language Currency -->
                        <!-- Header Top responsive Action --> */}
            <div className="col header-top-res d-lg-none">
              <div className="gi-header-bottons gi-header-buttons">
                <div className="right-icons">
                  {/* <!-- Header User Start --> */}
                  <Dropdown className="mobile-user-dropdown" style={{ marginRight: '15px' }}>
                    <Dropdown.Toggle
                      as="button"
                      id="mobile-user-menu"
                      className="gi-header-btn gi-header-user gi-header-rtl-btn border-0 bg-transparent p-0"
                      title="Account Menu"
                    >
                      <div className="header-icon">
                        <i className="fi-rr-user"></i>
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} href="/home" className="mobile-user-item">
                        <i className="fi-rr-home"></i> Home
                      </Dropdown.Item>
                      {isAuthenticated ? (
                        <>
                          <Dropdown.Item as={Link} href="/user-profile" className="mobile-user-item">
                            <i className="fi-rr-user"></i> My Profile
                          </Dropdown.Item>
                          <Dropdown.Item as={Link} href="/address" className="mobile-user-item">
                            <i className="fi-rr-marker"></i> Address
                          </Dropdown.Item>
                          <Dropdown.Item as={Link} href="/orders" className="mobile-user-item">
                            <i className="fi-rr-box"></i> Orders
                          </Dropdown.Item>
                          <Dropdown.Item as={Link} href="/track-order" className="mobile-user-item">
                            <i className="fi-rr-truck-moving"></i> Track Order
                          </Dropdown.Item>
                        </>
                      ) : (
                        <>
                          <Dropdown.Item as={Link} href="/track-order" className="mobile-user-item">
                            <i className="fi-rr-truck-moving"></i> Track Order
                          </Dropdown.Item>
                          <Dropdown.Item as={Link} href="/login" className="mobile-user-item">
                            <i className="fi-rr-sign-in-alt"></i> Login
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* <!-- Header User End -->
                                    <!-- Header All Products Start --> */}
                  <Link
                    href="/products"
                    className="gi-header-btn gi-header-rtl-btn"
                    title="All Products"
                    aria-label="All Products"
                  >
                    <div className="header-icon">
                      <i className="fi-rr-apps"></i>
                    </div>
                  </Link>
                  {/* <!-- Header All Products End -->
                                    <!-- Header Wishlist Start --> */}
                  <Link
                    href="/wishlist"
                    className="gi-header-btn gi-wish-toggle gi-header-rtl-btn"
                  >
                    <div className="header-icon">
                      <i className="fi-rr-heart"></i>
                    </div>
                    <span className="gi-header-count gi-wishlist-count">
                      {wishlistItems.length}
                    </span>
                  </Link>
                  {/* <!-- Header Wishlist End -->
                                    <!-- Header Cart Start --> */}
                  <Link href="" className="gi-header-btn gi-cart-toggle gi-header-rtl-btn">
                    <div onClick={openCart} className="header-icon">
                      <i className="fi-rr-shopping-bag"></i>
                      <span className="main-label-note-new"></span>
                    </div>
                    <span className="gi-header-count gi-cart-count">
                      {cartItemCount}
                    </span>
                  </Link>
                  {/* <!-- Header Cart End -->
                                    <!-- Header menu Start --> */}
                  <Link
                    onClick={openMobileManu}
                    href=""
                    className="gi-header-btn gi-site-menu-icon d-lg-none"
                  >
                    <i className="fi-rr-menu-burger"></i>
                  </Link>
                  {/* <!-- Header menu End --> */}
                </div>
              </div>
            </div>
            {/* <!-- Header Top responsive Action --> */}
          </div>
        </div>
      </div>
      <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
      <MobileManuSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileManu={closeMobileManu}
        toggleMainMenu={toggleMainMenu}
        activeMainMenu={activeMainMenu}
      />
    </>
  );
}

export default HeaderOne;
