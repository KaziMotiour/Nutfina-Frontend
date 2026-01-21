"use client";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { getRegistrationData } from "../login/RegisterPage";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import { User } from "@/store/reducers/userSlice";
import { getDefaultAddress } from "@/store/reducers/userSlice";

// export interface RegistrationData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   city: string;
//   postCode: string;
//   country: string;
//   state: string;
//   profilePhoto?: string;
//   description: string;
// }

const UserProfile = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const login = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.user.user);
  const defaultAddress = useSelector((state: RootState) => state.user.defaultAddress);
  const addressLoading = useSelector((state: RootState) => state.user.loading);
  const router = useRouter();

  useEffect(() => {
    if (login) {
      setUserData(user);
      dispatch(getDefaultAddress());
    }
  }, [login, router, user, dispatch]);

  if (!login) {
    return (
      <div className="container">
        <p>
          Please <a href="/login">login</a> or <a href="/register">register</a>{" "}
          to view this page.
        </p>
      </div>
    );
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    router.push("/profile-edit");
  };

  return (
    <>
      <section className="gi-vendor-profile padding-tb-40">
        <div className="container">
          <Row className="mb-minus-24px">
            <VendorSidebar />
            <Col lg={9} md={12} className="mb-24">
              <Row>
                <div className="container">
                  <div className="gi-vendor-cover">
                    <span
                      style={{ float: "inline-end", margin: "15px" }}
                      className="gi-register-wrap"
                    >
                      <button
                        onClick={handleSubmit}
                        style={{
                          backgroundColor: "white",
                          padding: "5px 10px",
                          borderRadius: "4px",
                        }}
                        className=""
                        type="submit"
                      >
                        Edit <i className="fi fi-rr-pencil"></i>
                      </button>
                    </span>
                    <div className="detail">
                      <img
                        src={
                          userData.avatar ||
                          process.env.NEXT_PUBLIC_URL +
                            "/assets/img/avatar/placeholder.jpg"
                        }
                        alt="vendor"
                      />
                      <div className="v-detail">
                        <h5>
                          {userData.full_name}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </Row>
              <div className="gi-vendor-profile-card gi-vendor-profile-card">
                <div className="gi-vendor-card-body">
                  <div className="gi-vender-about-block">
                    <h5>Account Information</h5>
                  </div>
                  <Row className="mb-minus-24px">
                    <div className="col-md-6 col-sm-12 mb-24">
                      <div className="gi-vendor-detail-block">
                        <h6>E-mail address</h6>
                        <ul>
                          <li>
                            <strong>Email 1 : </strong>
                            {userData.email}
                          </li>
                          {/* <li><strong>Email 2 : </strong>support2@exapmle.com</li> */}
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6 col-sm-12 mb-24">
                      <div className="gi-vendor-detail-block">
                        <h6>Contact nubmer</h6>
                        <ul>
                          <li>
                            <strong>Phone Nubmer 1 : </strong>
                            {userData.phone}
                          </li>
                          {/* <li><strong>Phone Nubmer 2 : </strong>(123) 123 456 7890</li> */}
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-12 col-sm-12 mb-24">
                      <div className="gi-vendor-detail-block">
                        <h6>Address Default</h6>
                        <ul>
                          {addressLoading ? (
                            <li>
                              <strong>Home : </strong>Loading...
                            </li>
                          ) : defaultAddress ? (
                            <>
                              <li>
                                <strong>Address : </strong>
                                {defaultAddress.full_address}
                              </li>
                              <li>
                                <strong>District : </strong>
                                {defaultAddress.district}
                              </li>
                              {defaultAddress.postal_code && (
                                <li>
                                  <strong>Postal Code : </strong>
                                  {defaultAddress.postal_code}
                                </li>
                              )}
                              <li>
                                <strong>Country : </strong>
                                {defaultAddress.country_name || defaultAddress.country}
                              </li>
                              {defaultAddress.phone && (
                                <li>
                                  <strong>Phone : </strong>
                                  {defaultAddress.phone}
                                </li>
                              )}
                            </>
                          ) : (
                            <li>
                              <strong>Home : </strong>No address found
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default UserProfile;
