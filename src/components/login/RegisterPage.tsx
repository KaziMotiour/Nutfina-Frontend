"use client";
import { useEffect, useRef } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Form } from "react-bootstrap";
import * as formik from "formik";
import * as yup from "yup";
import { registerUser, loginUser, getCurrentUser, clearError } from "@/store/reducers/userSlice";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";

const RegisterPage = ({ onSuccess = () => {}, onError = () => {} }) => {
  const { Formik } = formik;
  const formikRef = useRef<any>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Define Yup validation schema
  const schema = yup.object().shape({
    fullName: yup.string().required("Full name is required"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{11}$/, "Phone number must be 11 digits")
      .required("Phone number is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),
  });

  const initialValues = {
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  };

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const userState = useSelector((state: RootState) => state.user);
  const loading = userState?.loading ?? false;
  const userError = userState?.error ?? null;
  const isAuthenticated = userState?.isAuthenticated ?? false;

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (userError) {
      showErrorToast(userError);
      dispatch(clearError());
    }
  }, [userError, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      showSuccessToast("Registration successful! You are now logged in.");
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  // Auto-scroll to form when component mounts and data is loaded
  useEffect(() => {
    // Only scroll if country data is loaded (form is visible)
    if (formRef.current) {
      const scrollToForm = () => {
        if (formRef.current) {
          const element = formRef.current;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100; // Offset for header/navigation
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      };

      // Wait a bit for the form to be fully rendered
      setTimeout(scrollToForm, 500);
    }
  }, [formRef]);

  const onSubmit = async (values: any) => {
    try {
      // Map form values to backend API format
      const registrationData = {
        email: values.email,
        full_name: values.fullName.trim(),
        phone: values.phoneNumber,
        password: values.password,
        password2: values.confirmPassword,
      };

      // Register user
      const result = await dispatch(registerUser(registrationData));

      if (registerUser.fulfilled.match(result)) {
        // After successful registration, automatically login the user
        const loginResult = await dispatch(
          loginUser({
            email: values.email,
            password: values.password,
          })
        );

        if (loginUser.fulfilled.match(loginResult)) {
          // Fetch user data after successful login
          await dispatch(getCurrentUser());

          // // If address fields are provided, create an address
          // if (values.address && values.city && values.country) {
          //   try {
          //     await dispatch(
          //       createAddress({
          //         name: `${values.firstName} ${values.lastName}`.trim(),
          //         phone: values.phoneNumber,
          //         full_address: values.address,
          //         country: values.country,
          //         district: values.state || values.city,
          //         postal_code: values.postCode || "",
          //         is_default: true,
          //       })
          //     );
          //   } catch (addrError) {
          //     // Address creation is optional, don't fail registration if it fails
          //     console.error("Failed to create address:", addrError);
          //   }
          // }

          // Reset form after successful submission
          if (formikRef.current) {
            formikRef.current.resetForm();
          }

          // Success toast and redirect will be handled by useEffect watching isAuthenticated
        } else {
          // Login failed after registration
          showErrorToast("Registration successful, but login failed. Please login manually.");
          router.push("/login");
        }
      } else {
        // Error is handled by useEffect watching error state
        const errorMessage = result.payload as string || "Registration failed";
        showErrorToast(errorMessage);
      }
    } catch (err: any) {
      showErrorToast(err.message || "An unexpected error occurred");
    }
  };

  return (
    <>
      <Breadcrumb title={"Register Page"} />
      <section className="gi-register padding-tb-40">
        <div className="container" ref={formRef}>
          <div className="section-title-2">
            <h2 className="gi-title">
              Register<span></span>
            </h2>
            <p>Create your account to get started.</p>
          </div>
          <div className="row">
            <div className="gi-register-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="gi-register-container" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="gi-register-form">
                  <Formik
                    innerRef={formikRef}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                    validateOnChange={true}
                    validateOnBlur={true}
                  >
                    {({
                      handleSubmit,
                      handleChange,
                      values,
                      touched,
                      errors,
                    }) => (
                      <>
                        <Form noValidate onSubmit={handleSubmit}>
                          <span className="gi-register-wrap">
                            <label htmlFor="fullName">Full Name*</label>
                            <Form.Group>
                              <Form.Control
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={values.fullName}
                                onChange={handleChange}
                                isInvalid={touched.fullName && !!errors.fullName}
                                required
                              />
                              {touched.fullName && errors.fullName &&
                                typeof errors.fullName === "string" && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.fullName}
                                  </Form.Control.Feedback>
                                )}
                            </Form.Group>
                          </span>
                          <span
                            style={{ marginTop: "10px" }}
                            className="gi-register-wrap"
                          >
                            <label>Email*</label>
                            <Form.Group>
                              <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                                value={values.email}
                                onChange={handleChange}
                                isInvalid={touched.email && !!errors.email}
                              />
                              {touched.email && errors.email &&
                                typeof errors.email === "string" && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.email}
                                  </Form.Control.Feedback>
                                )}
                            </Form.Group>
                          </span>
                          <span
                            style={{ marginTop: "10px" }}
                            className="gi-register-wrap"
                          >
                            <label>Phone Number*</label>
                            <Form.Group>
                              <Form.Control
                                type="text"
                                name="phoneNumber"
                                placeholder="Enter your phone number"
                                pattern="^\d{10,12}$"
                                required
                                value={values.phoneNumber}
                                onChange={handleChange}
                                isInvalid={touched.phoneNumber && !!errors.phoneNumber}
                              />
                              {touched.phoneNumber && errors.phoneNumber &&
                                typeof errors.phoneNumber === "string" && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.phoneNumber}
                                  </Form.Control.Feedback>
                                )}
                            </Form.Group>
                          </span>
                          <span
                            style={{ marginTop: "10px" }}
                            className="gi-register-wrap"
                          >
                            <label>Password*</label>
                            <Form.Group>
                              <Form.Control
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                pattern="^\d{6,12}$"
                                required
                                value={values.password}
                                onChange={handleChange}
                                isInvalid={touched.password && !!errors.password}
                              />
                              {touched.password && errors.password &&
                                typeof errors.password === "string" && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.password}
                                  </Form.Control.Feedback>
                                )}
                            </Form.Group>
                          </span>
                          <span
                            style={{ marginTop: "10px" }}
                            className="gi-register-wrap"
                          >
                            <label>Confirm Password*</label>
                            <Form.Group>
                              <Form.Control
                                type="password"
                                name="confirmPassword"
                                placeholder="Enter your confirm password"
                                pattern="^\d{6,12}$"
                                required
                                value={values.confirmPassword}
                                onChange={handleChange}
                                isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                              />
                              {touched.confirmPassword && errors.confirmPassword &&
                                typeof errors.confirmPassword === "string" && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.confirmPassword}
                                  </Form.Control.Feedback>
                                )}
                            </Form.Group>
                          </span>
                          <span
                            style={{ marginTop: "10px" }}
                            className="gi-register-wrap gi-register-btn"
                          >
                            <span>
                              Already have an account?
                              <a href="/login">Login</a>
                            </span>
                            <button 
                              className="gi-btn-1" 
                              type="submit"
                              disabled={loading}
                            >
                              {loading ? "Registering..." : "Register"}
                            </button>
                          </span>
                        </Form>
                      </>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;

export const getRegistrationData = () => {
  if (typeof window !== "undefined") {
    const registrationData = localStorage.getItem("registrationData");
    return registrationData ? JSON.parse(registrationData) : [];
  }
  return [];
};

export const setRegistrationData = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("registrationData", JSON.stringify(data));
  }
};
