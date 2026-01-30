import React from "react";
import { Col, Row } from "react-bootstrap";

const About = () => {
  return (
    <section className="gi-about padding-tb-40">
      <div className="container">
        <Row className="align-items-center">
          <Col xl={6} md={12}>
            <div className="gi-about-img">
              <img src={ process.env.NEXT_PUBLIC_URL + "/assets/img/common/peanut_plant.jpg" } className="v-img" alt="about" /> 
              <img src={ process.env.NEXT_PUBLIC_URL + "/assets/img/common/cashew-tree.jpg" } className="h-img" alt="about" /> 
              <img src={ process.env.NEXT_PUBLIC_URL + "/assets/img/common/almond-tree.jpeg" } className="h-img" alt="about" />
            </div>
          </Col>

          <Col xl={6} md={12}>
            <div className="gi-about-detail">
              <div className="section-title">
                <h2>
                  Who We <span>Are</span>
                </h2>
                <p>
                  Nutfina is built around one simple idea — real nuts, real
                  nutrition, no shortcuts.
                </p>
              </div>

              <p>
                We focus on sourcing high-quality nuts and dry fruits, carefully
                selected and processed to retain their natural taste and
                nutritional value. No unnecessary additives. No artificial
                nonsense.
              </p>

              <p>
                Our goal is to make premium nuts accessible to everyday people
                in Bangladesh — whether it’s almonds, cashews, peanuts, or
                carefully crafted nut-based products.
              </p>

              <p>
                Nutfina isn’t about fancy claims. It’s about consistency,
                transparency, and products you can trust to be part of your
                daily nutrition.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default About;
