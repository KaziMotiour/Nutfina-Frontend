"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SidebarCart from "../../../model/SidebarCart";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout } from "@/store/reducers/userSlice";
import { setSearchTerm } from "@/store/reducers/filterReducer";

function HeaderTwo({ cartItemCount, wishlistItems }: { cartItemCount: number; wishlistItems: any[] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const userState = useSelector((state: RootState) => state.user);
  const isAuthenticated = userState?.isAuthenticated ?? false;
  const loading = userState?.loading ?? false;
  const error = userState?.error ?? null;
  const user = userState?.user ?? null;
  
  const { searchTerm } = useSelector((state: RootState) => state.filter);
  const [searchInput, setSearchInput] = useState(searchTerm || "");


  const handleSearch = (event: any) => {
    setSearchInput(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(setSearchTerm(searchInput));
    router.push("/search-page/?search=" + searchInput);
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
    window.location.reload();
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
              <div className="align-self-center gi-header-search">
                <div className="header-search">
                  <form
                    onSubmit={handleSubmit}
                    className="gi-search-group-form"
                    action="#"
                  >
                    <input
                      className="form-control gi-search-bar"
                      placeholder="Search Products..."
                      type="text"
                      value={searchInput}
                      onChange={handleSearch}
                    />
                    <button className="search_submit" type="submit">
                      <i className="fi-rr-search"></i>
                    </button>
                  </form>
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
