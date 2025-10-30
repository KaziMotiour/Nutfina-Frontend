"use client";
import React, { useState } from "react";
import home from "../../../../utility/header/home";
import classic from "../../../../utility/header/classic";
import banner from "../../../../utility/header/benner";
import column from "../../../../utility/header/columns";
import list from "../../../../utility/header/list";
import blog from "../../../../utility/header/blog";
import pages from "../../../../utility/header/pages";
import fruits from "../../../../utility/header/fruits";
import bakery from "../../../../utility/header/bakery";
import snacks from "../../../../utility/header/snacks";
import spice from "../../../../utility/header/spice";
import juice from "../../../../utility/header/juice";
import softdrink from "../../../../utility/header/softdrink";
import CashewRoastedNuts from "../../../../utility/header/cashewroastednuts";
import AlmondRoastedNuts from "../../../../utility/header/almondroastednuts";
import Link from "next/link";
import productpage from "../../../../utility/header/productpage";
import CurrentLocation from "./CurrentLocation";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Fade } from "react-awesome-reveal";

function HeaderManu() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleProductClick = (index: number) => {
    setSelectedIndex(index);
  };
  return (
    <>
      <div className="gi-header-cat d-none d-lg-block">
        <div className="container position-relative">
          <div className="gi-nav-bar">
            {/* <!-- Category Toggle --> */}
            <Tabs
              selectedIndex={selectedIndex}
              onSelect={(selectedIndex) => setSelectedIndex(selectedIndex)}
              className="gi-category-icon-block"
            >
              <div className="gi-category-menu">
                <div className="gi-category-toggle">
                  <i className="fi fi-rr-apps"></i>
                  <span className="text">All Categories</span>
                  <i
                    className="fi-rr-angle-small-down d-1199 gi-angle"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
              <div className="gi-cat-dropdown">
                <div className="gi-cat-block">
                  <div className="gi-cat-tab">
                    <TabList>
                      <div
                        className="gi-tab-list nav flex-column nav-pills me-3"
                        id="v-pills-tab"
                        role="tablist"
                        aria-orientation="vertical"
                      >
                        <Tab>
                          <button
                            className={`tab nav-link ${
                              selectedIndex == 0 ? "active" : ""
                            }`}
                            onClick={() => handleProductClick(0)}
                            key={"Dairy & Bakery"}
                            id="v-pills-home-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#v-pills-home"
                            type="button"
                            role="tab"
                            aria-controls="v-pills-home"
                            aria-selected="true"
                            style={{
                              padding: "10px 50px 10px 20px",
                              marginBottom: "10px",
                            }}
                          >
                            <i className="fi-rr-cupcake"></i>Roasted Nuts
                          </button>
                        </Tab>
                        <Tab>
                          <button
                            className={`nav-link ${
                              selectedIndex == 1 ? "active" : ""
                            }`}
                            onClick={() => handleProductClick(1)}
                            key={"Fruits & Vegetable"}
                            id="v-pills-profile-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#v-pills-profile"
                            type="button"
                            role="tab"
                            aria-controls="v-pills-profile"
                            aria-selected="false"
                            style={{
                              padding: "10px 22px",
                              marginBottom: "10px",
                            }}
                          >
                            <i className="fi fi-rs-apple-whole"></i>Nut Powder
                          </button>
                        </Tab>
                      
                      </div>
                    </TabList>
                    <div className="tab-content" id="v-pills-tabContent">
                      <Fade duration={500} delay={200}>
                        <TabPanel
                          className={`tab-pane fade ${
                            selectedIndex === 0
                              ? "show active product-block"
                              : ""
                          }`}
                          role="tabpanel"
                          aria-labelledby="v-pills-home-tab"
                        >
                          <div className="tab-list row">
                            <div className="col">
                              <h6 className="gi-col-title">Roasted Cashew</h6>
                              <ul className="cat-list">
                                {CashewRoastedNuts.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="col">
                              <h6 className="gi-col-title">Roasted Almond</h6>
                              <ul className="cat-list">
                                {AlmondRoastedNuts.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </TabPanel>
                      </Fade>
                      <Fade duration={500} delay={200}>
                        <TabPanel
                          className={`tab-pane fade ${
                            selectedIndex === 1
                              ? "show active product-block"
                              : ""
                          }`}
                          role="tabpanel"
                          aria-labelledby="v-pills-profile-tab"
                        >
                          <div className="tab-list row">
                            <div className="col">
                              <h6 className="gi-col-title">Nut Powder</h6>
                              <ul className="cat-list">
                                {CashewRoastedNuts.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {/* <div className="col">
                              <h6 className="gi-col-title">Almond Roasted Nuts</h6>
                              <ul className="cat-list">
                                {AlmondRoastedNuts.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div> */}
                          </div>
                        </TabPanel>
                      </Fade>
                    </div>
                  </div>
                </div>
              </div>
            </Tabs>

            {/* <!-- Main Menu Start --> */}
            <div
              id="gi-main-menu-desk"
              className="d-none d-lg-block sticky-nav"
            >
              <div className="nav-desk">
                <div className="row">
                  <div className="col-md-12 align-self-center">
                    <div className="gi-main-menu">
                      <ul>
                        <li className="dropdown drop-list">
                          <Link href="/" className="dropdown-arrow">
                            Home
                          </Link>
                          {/* <ul className="sub-menu">
                            {home.map((data, index) => (
                              <li key={index}>
                                <Link href={data.href}>{data.name}</Link>
                              </li>
                            ))}
                          </ul> */}
                        </li>
                        <li className="dropdown drop-list">
                          <Link href="/products" className="dropdown-arrow">
                            All Products
                          </Link>
                        </li>
                        {/* <li className="dropdown drop-list position-static">
                          <Link href="" className="dropdown-arrow">
                            Categories
                            <i className="fi-rr-angle-small-right"></i>
                          </Link>
                          <ul className="mega-menu d-block">
                            <li className="d-flex">
                              <span className="bg"></span>
                              <ul className="d-block mega-block">
                                <li className="menu_title">
                                  <Link href="/">Classic</Link>
                                </li>
                                {classic.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                              <ul className="d-block mega-block">
                                <li className="menu_title">
                                  <Link href="">Banner</Link>
                                </li>
                                {banner.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                              <ul className="d-block mega-block">
                                <li className="menu_title">
                                  <Link href="">Columns</Link>
                                </li>
                                {column.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                              <ul className="d-block mega-block">
                                <li className="menu_title">
                                  <Link href="">List</Link>
                                </li>
                                {list.map((data, index) => (
                                  <li key={index}>
                                    <Link href={data.href}>{data.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          </ul>
                        </li> */}
                        {/* <li className="dropdown drop-list">
                          <Link href="" className="dropdown-arrow">
                            Products<i className="fi-rr-angle-small-right"></i>
                          </Link>
                          <ul className="sub-menu">
                            {productpage.map((data, index) => (
                              <li
                                key={index}
                                className="dropdown position-static"
                              >
                                <Link href="">
                                  {data.name}
                                  <i className="fi-rr-angle-small-right"></i>
                                </Link>
                                <ul className="sub-menu sub-menu-child">
                                  {data.subname.map((subPage, subIndex) => (
                                    <React.Fragment key={subIndex}>
                                      <li>
                                        <Link href={subPage.href}>
                                          {subPage.name}
                                        </Link>
                                      </li>
                                    </React.Fragment>
                                  ))}
                                </ul>
                              </li>
                            ))}
                            <li>
                              <a href="/product-full-width">
                                Product full width
                              </a>
                            </li>
                            <li>
                              <a href="/product-according-full-width">
                                accordion full width
                              </a>
                            </li>
                          </ul>
                        </li> */}
                        <li className="dropdown drop-list">
                          <Link href="/blog-left-sidebar" className="dropdown-arrow">
                            Blog
                            {/* <i className="fi-rr-angle-small-right"></i> */}
                          </Link>
                          {/* <ul className="sub-menu">
                            {blog.map((data, index) => (
                              <li key={index}>
                                <Link href={data.href}>{data.name}</Link>
                              </li>
                            ))}
                          </ul> */}
                        </li>
                        <li className="dropdown drop-list">
                          <Link href="" className="dropdown-arrow">
                          Customer Center<i className="fi-rr-angle-small-right"></i>
                          </Link>
                          <ul className="sub-menu">
                            {pages.map((data, index) => (
                              <li key={index}>
                                <Link href={data.href}>{data.name}</Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        {/* <li className="non-drop">
                          <Link href="/banner-left-sidebar-col-3">
                            <i className="fi-rr-badge-percent"></i>Offers
                          </Link>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Main Menu End --> */}

            <CurrentLocation />
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderManu;
