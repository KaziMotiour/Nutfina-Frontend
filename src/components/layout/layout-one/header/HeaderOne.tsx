"use client";

import Link from "next/link";
import { useState } from "react";
import SidebarCart from "../../../model/SidebarCart";
import MobileManuSidebar from "../../../model/MobileManuSidebar";
import Dropdown from "react-bootstrap/Dropdown";

function HeaderOne({ cartItemCount, wishlistItems }: { cartItemCount: number; wishlistItems: any[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="header-top">
        <div className="container">
          <div className="row align-itegi-center">
            {/* <!-- Header Top Language Currency -->
                        <!-- Header Top responsive Action --> */}
            <div className="col header-top-res d-lg-none">
              <div className="gi-header-bottons gi-header-buttons">
                <div className="right-icons">
                  {/* <!-- Header User Start --> */}
                  <Link href="/login" className="gi-header-btn gi-header-user gi-header-rtl-btn">
                    <div className="header-icon">
                      <i className="fi-rr-user"></i>
                    </div>
                  </Link>
                  {/* <!-- Header User End -->
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
