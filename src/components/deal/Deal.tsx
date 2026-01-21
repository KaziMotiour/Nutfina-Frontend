"use client";
import { useRef } from "react";
import { Col, Row } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import ItemCard from "../product-item/ItemCard";
import { Fade } from "react-awesome-reveal";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import DealendTimer from "../dealend-timer/DealendTimer";
import Spinner from "../button/Spinner";

const Deal = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
  const { data, error } = useSWR("/api/deal", fetcher, { onSuccess, onError });
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  if (error) return <div>Failed to load products</div>;
  if (!data)
    return (
      <div>
        <Spinner />
      </div>
    );

  const getData = () => {
    if (hasPaginate) return data.data;
    else return data;
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <>
      <section
        className="gi-deal-section padding-tb-40 wow fadeInUp"
        data-wow-duration="2s"
      >
        <div className="container">
          <Row className="overflow-hidden m-b-minus-24px">
            <Col lg={12} className="gi-deal-section col-lg-12">
              <div className="gi-products">
                <div
                  className="section-title"
                  data-aos="fade-up"
                  data-aos-duration="2000"
                  data-aos-delay="200"
                >
                  <Fade triggerOnce direction="up" duration={2000} delay={200}>
                    <div className="section-detail">
                      <h2 className="gi-title">
                        Day of the <span>deal</span>
                      </h2>
                      <p>Don`t wait. The time will never be just right.</p>
                    </div>
                  </Fade>
                  <DealendTimer />
                </div>
                <Fade
                  triggerOnce
                  direction="up"
                  duration={500}
                  delay={100}
                  className="gi-deal-block m-minus-lr-12"
                >
                  <div className="deal-slick-carousel gi-product-slider slick-initialized slick-slider" style={{ position: "relative" }}>
                    <div className="slick-list draggable" style={{ position: "relative" }}>
                      <Swiper
                        onSwiper={(swiper) => {
                          swiperRef.current = swiper;
                        }}
                        modules={[Autoplay]}
                        loop={true}
                        autoplay={{ 
                          delay: 3000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        slidesPerView={5}
                        spaceBetween={20}
                        breakpoints={{
                          0: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                          },
                          320: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                          },
                          425: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                          },
                          640: {
                            slidesPerView: 2,
                            spaceBetween: 15,
                          },
                          768: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                          },
                          1024: {
                            slidesPerView: 3,
                            spaceBetween: 20,
                          },
                          1200: {
                            slidesPerView: 5,
                            spaceBetween: 20,
                          },
                          1440: {
                            slidesPerView: 5,
                            spaceBetween: 20,
                          },
                        }}
                        className="slick-track"
                      >
                        {getData()?.map((item: any, index: number) => (
                          <SwiperSlide key={index} className="slick-slide">
                            <ItemCard data={item} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      {/* Navigation Buttons */}
                      <div className="swiper-buttons" style={{ 
                        position: "absolute", 
                        top: "50%", 
                        left: 0,
                        right: 0,
                        transform: "translateY(-50%)",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        pointerEvents: "none",
                        zIndex: 100,
                        padding: "0 10px",
                      }}>
                        <button 
                          type="button"
                          ref={prevButtonRef}
                          onClick={handlePrev}
                          style={{
                            pointerEvents: "auto",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            color: "#333",
                            position: "relative",
                            zIndex: 101,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#5caf90";
                            e.currentTarget.style.borderColor = "#5caf90";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.borderColor = "#e0e0e0";
                            e.currentTarget.style.color = "#333";
                          }}
                          aria-label="Previous slide"
                        >
                          <i className="fi-rr-angle-small-left" style={{ fontSize: "20px" }}></i>
                        </button>
                        <button 
                          type="button"
                          ref={nextButtonRef}
                          onClick={handleNext}
                          style={{
                            pointerEvents: "auto",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            color: "#333",
                            position: "relative",
                            zIndex: 101,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#5caf90";
                            e.currentTarget.style.borderColor = "#5caf90";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                            e.currentTarget.style.borderColor = "#e0e0e0";
                            e.currentTarget.style.color = "#333";
                          }}
                          aria-label="Next slide"
                        >
                          <i className="fi-rr-angle-small-right" style={{ fontSize: "20px" }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </Fade>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Deal;
