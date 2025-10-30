"use client";
import Link from "next/link";
import { Fade } from "react-awesome-reveal";
import { Row } from "react-bootstrap";

const OfferBanners = () => {
  return (
    <>
      <section className="gi-offer-section padding-tb-40">
        <div className="container">
          {/* <!--  Offer banners --> */}
          <Row>
            <Fade
              triggerOnce
              direction="left"
              duration={2000}
              className="col-md-6 wow fadeInLeft"
              data-wow-duration="2s"
            >
              <div className="gi-ofr-banners">
                <div className="gi-bnr-body">
                  <div className="gi-bnr-img">
                    <span className="lbl">10% Off</span>
                    <img
                      src={
                        process.env.NEXT_PUBLIC_URL + "/assets/img/banner/2.jpg"
                      }
                      alt="banner"
                    />
                  </div>
                  <div className="gi-bnr-detail">
                    <h5>Roasted Nuts</h5>
                    <p>The flavor of something special</p>
                    <a href="/products/?category=roasted-nuts" className="gi-btn-2">
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </Fade>
            <Fade
              triggerOnce
              direction="right"
              duration={2000}
              className="col-md-6 wow fadeInRight"
              data-wow-duration="2s"
            >
              <div className="gi-ofr-banners m-t-767">
                <div className="gi-bnr-body">
                  <div className="gi-bnr-img">
                    <span className="lbl">10% Off</span>
                    <img
                      src={
                        process.env.NEXT_PUBLIC_URL + "/assets/img/banner/3.jpg"
                      }
                      alt="banner"
                    />
                  </div>
                  <div className="gi-bnr-detail">
                    <h5>Nut Protein Powder</h5>
                    <p>A healthy drink for every one</p>
                    <Link href="/products/?category=protein-powder" className="gi-btn-2">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </Fade>
          </Row>
        </div>
      </section>
    </>
  );
};

export default OfferBanners;
