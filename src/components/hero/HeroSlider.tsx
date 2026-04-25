"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import Link from "next/link";

interface SlideData {
  image: string;
  price?: string;
  title: string;
  link?: string;
  titleWhite?: boolean;
  priceRed?: boolean;
}

interface HeroSliderProps {
  slides?: SlideData[];
}

const defaultSlides: SlideData[] = [
  {
    image: `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/hero-bg/hero-image-1.png`,
    price: "610",
    title: "Fuel Your Day the Smart Way.",
    link: "/products",
  },
  {
    image: `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/hero-bg/hero-image-5.png`,
    price: "675",
    title: "Rich. Creamy. Irresistible",
    link: "/products",
    titleWhite: true,
    priceRed: true,
  },
  {
    image: `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/hero-bg/hero-image-3.png`,
    price: "250",
    title: "Natural Energy. Real Results",
    link: "/products",
  },
  // {
  //   image: `${process.env.NEXT_PUBLIC_URL || ""}/assets/img/hero-bg/hero-image-2.png`,
  //   price: "30.00",
  //   title: "Explore fresh & juicy fruits",
  //   link: "#",
  // }
];

function HeroSlider({ slides = defaultSlides }: HeroSliderProps) {
  return (
    <>
      <section className="section gi-hero m-tb-40">
        <div className="container">
          <div className="gi-main-content">
            {/* <!-- Hero Slider Start --> */}
            <div className="gi-slider-content">
              <div className="gi-main-slider">
                <>
                  {/* <!-- Main slider  --> */}
                  <Swiper
                    pagination={{
                      clickable: true,
                    }}
                    modules={[Pagination, Autoplay]}
                    loop={slides.length > 1}
                    speed={2000}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                    }}
                    slidesPerView={1}
                    className="swiper-pagination-white gi-slider main-slider-nav main-slider-dot swiper-wrapper"
                  >
                    {slides.map((slide, index) => (
                      <SwiperSlide
                        key={index}
                        className="gi-slide-item swiper-slide d-flex"
                        style={{
                          backgroundImage: `url(${slide.image})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }}
                      >
                        <div className="gi-slide-content slider-animation">
                          {slide.price && (
                            <p style={slide.priceRed ? { color: "#e53935" } : undefined}>
                              Starting at <b>{slide.price} BDT</b>
                            </p>
                          )}
                          <h1
                              className="gi-slide-title"
                              style={slide.titleWhite ? { color: "#fff" } : undefined}
                            >
                              {slide.title}
                            </h1>
                          <div className="gi-slide-btn">
                            {slide.link ? (
                              <Link href={slide.link} className="gi-btn-1">
                                Shop Now{" "}
                                <i
                                  className="fi-rr-angle-double-small-right"
                                  aria-hidden="true"
                                ></i>
                              </Link>
                            ) : (
                              <a href="#" className="gi-btn-1">
                                Shop Now{" "}
                                <i
                                  className="fi-rr-angle-double-small-right"
                                  aria-hidden="true"
                                ></i>
                              </a>
                            )}
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                    <div className=" swiper-pagination swiper-pagination-white"></div>
                    <div className="swiper-buttons">
                      <div className="swiper-button-next"></div>
                      <div className="swiper-button-prev"></div>
                    </div>
                  </Swiper>
                </>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSlider;
