"use client";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ItemCard from "../product-item/ItemCard";
import { Fade } from "react-awesome-reveal";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import DealendTimer from "../dealend-timer/DealendTimer";
import Spinner from "../button/Spinner";
import { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import ProductAll from "../product-item/ProductItem";

const RoastedNuts = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleProductClick = (index: number) => {
      setSelectedIndex(index);
    };

    return (
    <>
        <section
          className="gi-product-tab gi-products padding-tb-40 wow fadeInUp"
          data-wow-duration="2s"
        >
            <div className="container">
                <Tabs
                  selectedIndex={selectedIndex}
                  onSelect={(selectedIndex) => setSelectedIndex(selectedIndex)}
                >
                    <div className="gi-tab-title">
                        <div className="gi-main-title">
                            <div className="section-title">
                                <div className="section-detail">
                                    <h2 className="gi-title">
                                        Roasted Nuts
                                    </h2>
                                    <p>A healthy snack for every one</p> 
                                </div>
                            </div>
                        </div>
                        {/* <!-- Tab Start --> */}
                        <TabList className="gi-pro-tab">
                            <ul className="gi-pro-tab-nav nav">
                                <Tab
                                    style={{ outline: "none" }}
                                    className="nav-item gi-header-rtl-arrival"
                                    key={"nut-protein-powder"}
                                >
                                    <a
                                        className={`nav-link ${
                                          selectedIndex == 0 ? "active" : ""
                                        }`}
                                        onClick={() => handleProductClick(0)}
                                        data-bs-toggle="tab"
                                        href="/products/?category=roasted-nuts"
                                    >
                                        All Roasted Nuts<i className="fi-rr-angle-double-small-right"></i>
                                    </a>
                                </Tab>
                            </ul>
                        </TabList>
                        {/* <!-- Tab End --> */}
                    </div>
                    {/* <!-- New Product --> */}
                    <Row className="m-b-minus-24px">
                        <Col lg={12}>
                            <div className="tab-content">
                                {/* <!-- 1st Product tab start --> */}
                                <TabPanel>
                                    <Fade
                                        triggerOnce
                                        duration={400}
                                        className={`tab-pane fade ${
                                          selectedIndex === 0 ? "show active product-block" : ""
                                        }`}
                                    >
                                        <Row>
                                          <ProductAll url="/api/products" />
                                        </Row>
                                    </Fade>
                                </TabPanel>
                            </div>
                        </Col>
                    </Row>
                </Tabs>
            </div>
        </section>
    </>
    );

};

export default RoastedNuts;
