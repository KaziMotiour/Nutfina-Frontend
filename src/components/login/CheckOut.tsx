"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import { Col, Form, Row } from "react-bootstrap";
import Spinner from "../button/Spinner";
import { useRouter } from "next/navigation";
import { clearCart, setOrders, setSwitchOn } from "@/store/reducers/cartSlice";
import { loginUser, getCurrentUser, getUserAddress, getDefaultAddress, createAddress, Address as BackendAddress } from "@/store/reducers/userSlice";
import { mergeCart, getCart, CartItem as BackendCartItem, checkout } from "@/store/reducers/orderSlice";
import { showErrorToast, showSuccessToast } from "../toast-popup/Toastify";
import DiscountCoupon from "../discount-coupon/DiscountCoupon";

interface Address {
  id: string;
  name: string;
  email: string;
  phone: string;
  full_address: string;
  country: string;
  country_name?: string;
  district: string;
  postal_code: string;
  is_default: boolean;
}

interface Registration {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  postCode: string;
  country: string;
  state: string;
  password: string;
  uid: any;
}

interface FormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  state: string;
}

interface Country {
  id: string;
  name: any;
  iso2: string;
}

interface State {
  id: string;
  name: any;
  state_code: string;
}

interface City {
  id: string;
  name: any;
  iso2: string;
}

const CheckOut = ({
  onSuccess = () => {},
  hasPaginate = false,
  onError = () => {},
}) => {
    const [email, setEmail] = useState("");
    const [validated, setValidated] = useState(false);
    const [password, setPassword] = useState("");
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [errors, setErrors] = useState<{
      password?: string;
      confirmPassword?: string;
      name?: string;
      email?: string;
      phone?: string;
      full_address?: string;
      country?: string;
      country_name?: string;
      district?: string;
      postal_code?: string;
      is_default?: boolean;
    }>({});
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const cart = useSelector((state: RootState) => state.order.cart);
    const cartLoading = useSelector((state: RootState) => state.order.loading);
    const orders = useSelector((state: RootState) => state.cart.orders);
    const isLogin = useSelector(
      (state: RootState) => state.user?.isAuthenticated ?? false
    );
    const loginLoading = useSelector((state: RootState) => state.user?.loading ?? false);
    const loginError = useSelector((state: RootState) => state.user?.error ?? null);
    const userAddresses = useSelector((state: RootState) => state.user?.address ?? []);
    const defaultAddress = useSelector((state: RootState) => state.user?.defaultAddress ?? null);
    const [subTotal, setSubTotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<{
      code: string;
      discountAmount: number;
      coupon: any;
    } | null>(null);
    const [selectedMethod, setSelectedMethod] = useState("free");
    const [checkOutMethod, setCheckOutMethod] = useState("guest");
    const [billingMethod, setBillingMethod] = useState("new");
    const [billingVisible, setBillingVisible] = useState(false);
    const [addressVisible, setAddressVisible] = useState<any[]>([]);
    const [optionVisible, setOptionVisible] = useState(!isLogin);
    const [loginVisible, setLoginVisible] = useState(false);
    const [btnVisible, setBtnVisible] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [filteredCountryData, setFilteredCountryData] = useState<Country[]>([]);
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const checkboxRef = useRef<HTMLInputElement>(null);
    const userExplicitlyChoseNew = useRef(false);

    // Fetch cart on mount
    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    // Transform backend cart items to component format
    const cartItems = React.useMemo(() => {
        if (!cart || !cart.items || cart.items.length === 0) return [];

        return cart.items.map((item: BackendCartItem) => {
            const variant = item.variant_detail || {};
            const product = (item as any).product_detail || {};
            
            // Get images - prefer variant images, fallback to product images
            const variantImages = variant.images || variant.product_images || [];
            const productImages = product.images || [];
            const images = variantImages.length > 0 ? variantImages : productImages;
            const firstImage = images.find((img: any) => img.is_active) || images[0] || {};

            // Get product name - prefer product name, fallback to variant name
            const title = product.name || variant.name || "Product";

            // Get image URL
            const imageUrl = firstImage.image || firstImage.image_url || "/assets/img/common/placeholder.png";

            return {
                id: item.id,
                variant_id: item.variant,
                title: title,
                newPrice: parseFloat(item.unit_price),
                quantity: item.quantity,
                image: imageUrl,
                line_total: parseFloat(item.line_total),
            };
        });
    }, [cart]);

    const [formData, setFormData]: any = useState({
      name: "",
      email: "",
      phone: "",
      full_address: "",
      country: "BD", // Default to Bangladesh
      district: "",
      postal_code: "",
      is_default: false,
    });

    const { data: country } = useSWR("/api/country", fetcher, {
        onSuccess,
        onError,
    });

    // Helper function to convert backend address to local address format
    const convertBackendAddressToLocal = (backendAddr: BackendAddress): Address => {
        return {
            id: backendAddr.id.toString(),
            name: backendAddr.name || "",
            email: backendAddr.email || "",
            phone: backendAddr.phone || "",
            full_address: backendAddr.full_address || "",
            country: backendAddr.country || "",
            country_name: (backendAddr.country_name as string) || "",
            district: backendAddr.district || "",
            postal_code: backendAddr.postal_code || "",
            is_default: backendAddr.is_default || false,
        };
    };

    // Fetch addresses when user logs in
    useEffect(() => {
        if (isLogin) {
            const fetchUserAddresses = async () => {
                try {
                    // Fetch all addresses and default address
                    await Promise.all([
                        dispatch(getUserAddress()),
                        dispatch(getDefaultAddress()),
                    ]);
                } catch (error) {
                    console.error("Error fetching addresses:", error);
                }
            };

          fetchUserAddresses();
        }
    }, [isLogin, dispatch]);

    // Update addressVisible when userAddresses or defaultAddress changes
    useEffect(() => {
        if (isLogin && userAddresses.length > 0) {
            // Convert backend addresses to local format
            const convertedAddresses: Address[] = userAddresses.map((address: BackendAddress) => convertBackendAddressToLocal(address));

            // Always update the visible addresses
            setAddressVisible(convertedAddresses);

            // If user has addresses and hasn't explicitly chosen "new", default to "use existing address"
            if (!userExplicitlyChoseNew.current) {
                // Set billing method to "use" if user has addresses
                if (billingMethod === "new" && convertedAddresses.length > 0) {
                    setBillingMethod("use");
                }

                // Auto-select address if none is selected
                if (!selectedAddress) {
                    // Set default address as selected if available, otherwise use first address
                    if (defaultAddress) {
                        const defaultAddr = convertBackendAddressToLocal(defaultAddress);
                        setSelectedAddress(defaultAddr);
                    } else if (convertedAddresses.length > 0) {
                        setSelectedAddress(convertedAddresses[0]);
                    }
                }
            }
        } else if (!isLogin) {
            // For guest users, always show the form (no saved addresses)
            setAddressVisible([]);
        }
    }, [isLogin, userAddresses, defaultAddress, billingMethod, selectedAddress]);

    // Auto-set billing method to "use" when an address is selected
    // But only if user hasn't explicitly chosen "new"
    useEffect(() => {
        if (selectedAddress && !userExplicitlyChoseNew.current && billingMethod !== "new") {
            setBillingMethod("use");
        }
    }, [selectedAddress, billingMethod]);

    useEffect(() => {
        if (isLogin) {
            setBtnVisible(false);
            setOptionVisible(false);
            setBillingVisible(true);
        } else {
            // For logged-out users, show billing form when guest account is selected
            if (checkOutMethod === "guest") {
                setBillingVisible(true);
                setOptionVisible(true);
            }
        }
    }, [isLogin, checkOutMethod]);

    useEffect(() => {
        if (country) {
            setFilteredCountryData(
                country.map((country: any) => ({
                    id: country.id,
                    countryName: country.name,
                    iso2: country.iso2,
                }))
            );
        }
    }, [country]);

  const handleDeliveryChange = (event: any) => {
    setSelectedMethod(event.target.value);
  };

  const handleBillingChange = (event: any) => {
    console.log(event.target.value);
    const newMethod = event.target.value;
    setBillingMethod(newMethod);
    
    // If switching to "new", clear the selected address and mark as user choice
    if (newMethod === "new") {
      userExplicitlyChoseNew.current = true;
      setSelectedAddress(null);
      localStorage.removeItem("selectedAddress");
    } else {
      // User chose to use existing address
      userExplicitlyChoseNew.current = false;
    }
  };

  const handleCheckOutChange = (event: any) => {
    const method = event.target.value;
    setCheckOutMethod(method);

    if (method === "guest") {
      // For guest checkout, show billing form directly
      setBillingVisible(true);
      setLoginVisible(false);
      setBtnVisible(false);
      setOptionVisible(false);
    }
  };

  const handleContinueBtn = () => {
    if (checkOutMethod === "register") {
      router.push("/register");
    } else if (checkOutMethod === "guest") {
      setBillingVisible(true);
      setLoginVisible(false);
      setBtnVisible(false);
    } else if (checkOutMethod === "login") {
      setBillingVisible(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.full_address || !formData.country || !formData.district) {
      setValidated(true);
      showErrorToast("Please fill in all required fields");
      return;
    }

    // Prepare address data according to backend model
    const addressData: Omit<BackendAddress, "id" | "user" | "created" | "last_modified" | "country_name"> = {
      name: formData.name.trim(),
      email: formData.email?.trim() || "",
      phone: formData.phone.trim(),
      full_address: formData.full_address.trim(),
      country: formData.country,
      district: formData.district.trim(),
      postal_code: formData.postal_code?.trim() || "",
      is_default: formData.is_default || false,
    };

    // If user is logged in, save to backend
    if (isLogin) {
      try {
        const result = await dispatch(createAddress(addressData as any));
        
        if (createAddress.fulfilled.match(result)) {
          showSuccessToast("Address added successfully!");
          
          // Refresh addresses list
          await Promise.all([
            dispatch(getUserAddress()),
            dispatch(getDefaultAddress())
          ]);
          
          // Convert backend address to local format for selection
          const backendAddr = result.payload as BackendAddress;
          const localAddress = convertBackendAddressToLocal(backendAddr);
          setSelectedAddress(localAddress);
          
          // Switch to "use existing address" mode if not already
          if (billingMethod === "new") {
            // Keep it as "new" but the address is now available in the list
            setBillingMethod("use");
          }
          
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            full_address: "",
            country: "BD", // Default to Bangladesh
            district: "",
            postal_code: "",
            is_default: false,
          });
          
          setValidated(false);
        } else {
          // Handle error from backend
          const errorMessage = result.payload as string;
          if (typeof errorMessage === 'string') {
            showErrorToast(errorMessage);
          } else if (errorMessage && typeof errorMessage === 'object') {
            // Handle validation errors from backend
            const errors = Object.values(errorMessage).flat().join(', ');
            showErrorToast(errors || "Failed to add address");
          } else {
            showErrorToast("Failed to add address. Please try again.");
          }
        }
      } catch (error: any) {
        console.error("Error creating address:", error);
        showErrorToast(error?.message || "Failed to add address. Please try again.");
      }
    } else {
      // For guest users, just show success message (address will be saved during checkout)
      showSuccessToast("Address information saved! You can now proceed to checkout.");
      setValidated(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const storedRegistrations = JSON.parse(
      localStorage.getItem("registrationData") || "[]"
    );
    setRegistrations(storedRegistrations);
  }, []);


  // item Price - Update from backend cart
  useEffect(() => {
    if (cart) {
      const subtotal = parseFloat(cart.subtotal || "0");
      setSubTotal(subtotal);
      // Calculate VAT (20%)
      // const vatAmount = subtotal * 0.2;
      // setVat(vatAmount);
    } else {
      setSubTotal(0);
      setVat(0);
    }
  }, [cart]);

  const handleDiscountApplied = (couponData: {
    code: string;
    discountAmount: number;
    coupon: any;
  }) => {
    if (couponData && couponData.code) {
      // Coupon applied
      setAppliedCoupon(couponData);
      setDiscountAmount(couponData.discountAmount);
      setDiscount(couponData.discountAmount);
    } else {
      // Coupon removed
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setDiscount(0);
    }
  };

  const total = subTotal + vat - discountAmount;
  // item Price end

  const { data, error } = useSWR("/api/deal", fetcher, { onSuccess, onError });

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

  const generateRandomId = () => {
    const randomNum = Math.floor(Math.random() * 100000);
    return `${randomNum}`;
  };

  const randomId = generateRandomId();

  // Check if all required information is filled
  const isCheckoutDisabled = () => {
    // Terms & Conditions must be checked
    // if (!isTermsChecked) {
    //   return true;
    // }

    // Either an address must be selected, or form must have all required fields
    if (selectedAddress) {
      return false; // Address is selected, can proceed
    }

    // Check if form has all required fields
    const hasRequiredFields = 
      formData.name?.trim() &&
      formData.phone?.trim() &&
      formData.full_address?.trim() &&
      formData.country &&
      formData.district?.trim();

    return !hasRequiredFields;
  };

  const handleCheckout = async () => {
    try {
      // Validate cart is not empty
      if (!cart || !cart.items || cart.items.length === 0) {
        showErrorToast("Your cart is empty.");
        return;
      }

      // Set loading state to show spinner
      setCheckoutLoading(true);

      // Prepare checkout payload
      const checkoutPayload: {
        address_id?: number;
        address?: {
          name: string;
          email?: string;
          phone: string;
          full_address: string;
          country: string;
          district: string;
          postal_code?: string;
          is_default?: boolean;
        };
        coupon_code?: string;
        payment_method?: string;
        shipping_fee?: number;
        notes?: string;
      } = {};

      // Determine address strategy
      if (isLogin) {
        // Logged-in user
        if (selectedAddress && selectedAddress.id) {
          // Use existing address - send address_id only
          checkoutPayload.address_id = parseInt(selectedAddress.id);
        } else {
          // New address - validate and send full address payload
          if (!formData.name || !formData.phone || !formData.full_address || !formData.country || !formData.district) {
            setCheckoutLoading(false);
            showErrorToast("Please fill in all required address fields.");
            setValidated(true);
            return;
          }

          checkoutPayload.address = {
            name: formData.name.trim(),
            email: formData.email?.trim() || "",
            phone: formData.phone.trim(),
            full_address: formData.full_address.trim(),
            country: formData.country,
            district: formData.district.trim(),
            postal_code: formData.postal_code?.trim() || "",
            is_default: formData.is_default || false,
          };
        }
      } else {
        // Guest user - always send full address payload
        if (!formData.name || !formData.phone || !formData.full_address || !formData.country || !formData.district) {
          setCheckoutLoading(false);
          showErrorToast("Please fill in all required address fields.");
          setValidated(true);
          return;
        }

        checkoutPayload.address = {
          name: formData.name.trim(),
          email: formData.email?.trim() || "",
          phone: formData.phone.trim(),
          full_address: formData.full_address.trim(),
          country: formData.country,
          district: formData.district.trim(),
          postal_code: formData.postal_code?.trim() || "",
        };
      }

      // Add optional fields
      if (appliedCoupon && appliedCoupon.code) {
        checkoutPayload.coupon_code = appliedCoupon.code;
      }

      checkoutPayload.payment_method = "COD"; // Cash on Delivery
      checkoutPayload.shipping_fee = 0; // Free shipping

      // Call backend checkout API
      const result = await dispatch(checkout(checkoutPayload));

      if (checkout.fulfilled.match(result)) {
        showSuccessToast("Order placed successfully!");
        
        // Clear local cart state
        dispatch(clearCart());
        
        // Get order data from response and navigate to invoice page
        // Prefer order_number over ID as it's more user-friendly
        const orderData = result.payload as any;
        const order = orderData?.order || orderData;
        const orderNumber = order?.order_number;
        const orderId = order?.id;
        
        if (orderNumber) {
          // Use order_number if available (more user-friendly)
          router.push(`/user-invoice/${orderNumber}`);
        } else if (orderId) {
          // Fallback to order ID
          router.push(`/user-invoice/${orderId}`);
        } else {
          // Fallback to orders page if neither is available
          router.push("/orders");
        }
      } else {
        // Handle error from backend
        const errorMessage = result.payload as string;
        if (typeof errorMessage === 'string') {
          showErrorToast(errorMessage);
        } else if (errorMessage && typeof errorMessage === 'object') {
          // Handle validation errors from backend
          const errors = Object.values(errorMessage).flat().join(', ');
          showErrorToast(errors || "Failed to place order");
        } else {
          showErrorToast("Failed to place order. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      showErrorToast(error?.message || "An unexpected error occurred during checkout.");
    }
  };

  const handleRemoveAddress = (index: number) => {
    const updatedAddresses = addressVisible.filter((_, i) => i !== index);
    localStorage.setItem("shippingAddresses", JSON.stringify(updatedAddresses));
    setAddressVisible(updatedAddresses);
  };

  const handleSelectAddress = (address: any) => {
    localStorage.setItem("selectedAddress", JSON.stringify(address));
    setSelectedAddress(address);
    // Reset the flag since user is now selecting an existing address
    userExplicitlyChoseNew.current = false;
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    console.log(email, password);
    const form = e.currentTarget;
    console.log(form);
    console.log(form.checkValidity());
    if (form.checkValidity() === true) {

      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Validate email and password
    if (!email || !password) {
      setValidated(true);
      showErrorToast("Please enter both email and password");
      return;
    }

    try {
      console.log("loginUser");
      // Dispatch login action
      const result = await dispatch(loginUser({ email, password })).unwrap();

      console.log(result);
      // If login successful, fetch current user data
      if (result) {
        await dispatch(getCurrentUser()).unwrap();
        // Merge guest cart with user cart (backend handles this automatically via get_active_cart)
        await dispatch(mergeCart());
        showSuccessToast("User Login Success");
        // Clear form
        setEmail("");
        setPassword("");
        setValidated(false);
      }
    } catch (error: any) {
      // Error is already handled by the thunk, but show user-friendly message
      showErrorToast(error || "Invalid email or password");
    }
  };

  const handleCountryChange = (e: any) => {
    handleInputChange(e);
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} />
      {/* Full-page spinner overlay during checkout */}
      {checkoutLoading && (
        <Spinner />
      )}
      <section className="gi-checkout-section padding-tb-40">
        <h2 className="d-none">Checkout Page</h2>
        <div className="container">
          {cartItems.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "300",
              }}
              className="gi-pro-content cart-pro-title"
            >
              {" "}
              Your cart is currently empty. Please add items to your cart to
              proceed.
            </div>
          ) : (
            <Row>
              {/* <!-- Address Form - Left Side (Desktop), Top (Mobile) --> */}
              <Col lg={8} md={12} className="gi-checkout-leftside order-1 order-lg-1">
                {/* <!-- checkout content Start --> */}
                <div className="gi-checkout-content">
                  <div className="gi-checkout-inner">
                    {/* {optionVisible && (
                      <>
                        <div className="gi-checkout-wrap m-b-40">
                          <div className="gi-checkout-block">
                            <h3 className="gi-checkout-title">New Customer</h3>
                            <div className="gi-check-block-content">
                              <div className="gi-check-subtitle">
                                Checkout Options
                              </div>
                              <form action="#">
                                <span className="gi-new-option">
                                  <span>
                                    <input
                                      type="radio"
                                      id="account2"
                                      name="radio-group"
                                      value="guest"
                                      checked={checkOutMethod === "guest"}
                                      onChange={handleCheckOutChange}
                                    />
                                    <label htmlFor="account2">
                                      Guest Account
                                    </label>
                                  </span>
                                </span>
                              </form>

                              {!isLogin && checkOutMethod === "guest" && (
                                <>
                                  <div className="gi-new-desc">
                                    By creating an account you will be able to
                                    shop faster, be up to date on an order`s
                                    status, and keep track of the orders you
                                    have previously made.
                                  </div>
                                </>
                              )}

                              {!isLogin && (
                                <>
                                  {loginVisible && (
                                    <div
                                      style={{ marginTop: "15px" }}
                                      className=" m-b-40"
                                    >
                                      <div className="gi-checkout-block gi-check-login">
                                        <div className="gi-check-login-form">
                                          <Form
                                            noValidate
                                            validated={validated}
                                            onSubmit={handleLogin}
                                            action="#"
                                            method="post"
                                          >
                                            <span className="gi-check-login-wrap">
                                              <label>Email Address</label>
                                              <Form.Group>
                                                <Form.Control
                                                  type="text"
                                                  name="email"
                                                  placeholder="Enter your email address"
                                                  value={email}
                                                  onChange={(e) =>
                                                    setEmail(e.target.value)
                                                  }
                                                  required
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                  Please Enter correct username.
                                                </Form.Control.Feedback>
                                              </Form.Group>
                                            </span>
                                            <span
                                              style={{ marginTop: "24px" }}
                                              className="gi-check-login-wrap"
                                            >
                                              <label>Password</label>
                                              <Form.Group>
                                                <Form.Control
                                                  type="password"
                                                  name="password"
                                                  pattern="^\d{6,12} BDT"
                                                  placeholder="Enter your password"
                                                  required
                                                  value={password}
                                                  onChange={(e) =>
                                                    setPassword(e.target.value)
                                                  }
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                  Please Enter 6-12 digit
                                                  number.
                                                </Form.Control.Feedback>
                                              </Form.Group>
                                            </span>
                                            <span className="gi-check-login-wrap gi-check-login-btn">
                                              <button
                                                className="gi-btn-2"
                                                type="submit"
                                                disabled={loginLoading}
                                              >
                                                {loginLoading ? (
                                                  <>
                                                    <Spinner /> Logging in...
                                                  </>
                                                ) : (
                                                  "Continue"
                                                )}
                                              </button>
                                              <a
                                                className="gi-check-login-fp"
                                                href="#"
                                              >
                                                Forgot Password?
                                              </a>
                                            </span>
                                          </Form>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )} */}

                    {billingVisible && (
                      <div className="gi-checkout-wrap m-b-30 padding-bottom-3">
                        <div className="gi-checkout-block gi-check-bill">
                          <h3 className="gi-checkout-title">Billing Details</h3>
                          <div className="gi-bl-block-content">
                            {/* For logged-out users: Show login prompt */}
                            {!isLogin && (
                              <div
                                style={{
                                  padding: "15px 20px",
                                  backgroundColor: "#f0f8ff",
                                  border: "1px solid #5caf90",
                                  borderRadius: "5px",
                                  marginBottom: "20px",
                                  textAlign: "center",
                                }}
                              >
                                <p style={{ margin: 0, color: "#333", fontSize: "14px" }}>
                                  <strong style={{ color: "#5caf90" }}>
                                    💡 Want to save your addresses for faster checkout?
                                  </strong>{" "}
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCheckOutMethod("login");
                                      setLoginVisible(true);
                                      setBillingVisible(false);
                                    }}
                                    style={{
                                      color: "#5caf90",
                                      textDecoration: "underline",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Log in here
                                  </a>
                                </p>
                              </div>
                            )}

                            {/* For logged-in users: Show radio options */}
                            {isLogin && (
                              <>
                                <div className="gi-check-subtitle">
                                  Checkout Options
                                </div>
                                <span className="gi-bill-option">
                                  <span>
                                    <input
                                      type="radio"
                                      id="bill1"
                                      name="radio-group"
                                      value="use"
                                      checked={billingMethod === "use"}
                                      onChange={handleBillingChange}
                                      disabled={addressVisible.length === 0}
                                    />
                                    <label htmlFor="bill1">
                                      I want to use an existing address
                                    </label>
                                  </span>
                                  <span>
                                    <input
                                      type="radio"
                                      id="bill2"
                                      name="radio-group"
                                      value="new"
                                      checked={billingMethod === "new"}
                                      onChange={handleBillingChange}
                                    />
                                    <label htmlFor="bill2">
                                      I want to use new address
                                    </label>
                                  </span>
                                </span>
                              </>
                            )}

                            {/* Address Form - Show for logged-out users OR when logged-in user chooses "new" or has no addresses */}
                            {(!isLogin || billingMethod === "new" || addressVisible.length === 0) && (
                              <div className="gi-check-bill-form">
                                <style>{`
                                  @media (max-width: 772px) {
                                    .gi-check-bill-form .gi-bill-wrap {
                                      width: 100% !important;
                                      display: block !important;
                                      margin-right: 0 !important;
                                    }
                                    .gi-check-bill-form .gi-bill-half {
                                      width: 100% !important;
                                      display: block !important;
                                    }
                                  }
                                  .gi-check-bill-form .gi-check-order-btn {
                                    display: block !important;
                                    width: 100% !important;
                                    text-align: right !important;
                                    margin-top: 10px !important;
                                  }
                                `}</style>
                                <Form
                                  noValidate
                                  validated={validated}
                                  onSubmit={(e) => e.preventDefault()}
                                  action="#"
                                  method="post"
                                >
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap"
                                  >
                                    <label>Name*</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        Please Enter Name.
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </span>
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap gi-bill-half"
                                  >
                                    <label>Email</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email (optional)"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                      />
                                    </Form.Group>
                                  </span>
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap gi-bill-half"
                                  >
                                    <label>Phone*</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        Please Enter Phone Number.
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </span>
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap"
                                  >
                                    <label>Full Address*</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="full_address"
                                        placeholder="Enter your full address"
                                        value={formData.full_address}
                                        onChange={handleInputChange}
                                        required
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        Please Enter Full Address.
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </span>
                                  <Form.Group
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap gi-bill-half"
                                  >
                                    <label>Country*</label>
                                    <span className="gi-bl-select-inner">
                                      <Form.Select
                                        size="sm"
                                        style={{ width: "1px" }}
                                        name="country"
                                        id="gi-select-country"
                                        className="gi-bill-select"
                                        value={formData.country}
                                        onChange={handleCountryChange}
                                        isInvalid={
                                          validated && !formData.country
                                        }
                                        required
                                      >
                                        <option value="" disabled>
                                          Country
                                        </option>
                                        {filteredCountryData.map(
                                          (country: any, index: number) => (
                                            <option
                                              key={index}
                                              value={country.iso2}
                                            >
                                              {country.countryName}
                                            </option>
                                          )
                                        )}
                                      </Form.Select>
                                    </span>
                                  </Form.Group>
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap gi-bill-half"
                                  >
                                    <label>District*</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="district"
                                        placeholder="Enter district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                      />
                                      <Form.Control.Feedback type="invalid">
                                        Please Enter District.
                                      </Form.Control.Feedback>
                                    </Form.Group>
                                  </span>
                                  <span
                                    style={{ marginTop: "10px" }}
                                    className="gi-bill-wrap gi-bill-half"
                                  >
                                    <label>Postal Code</label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="postal_code"
                                        placeholder="Postal Code (optional)"
                                        value={formData.postal_code}
                                        onChange={handleInputChange}
                                      />
                                    </Form.Group>
                                  </span>
                                </Form>
                              </div>
                            )}
                            {/* Show existing addresses only for logged-in users */}
                            {isLogin && billingMethod === "use" &&
                              addressVisible.length > 0 && (
                                <>
                                  <div className="gi-checkout-block gi-check-bill">
                                    <div className="gi-sidebar-block">
                                      <div className="gi-sb-title">
                                        <h3 className="gi-sidebar-title">
                                          Address
                                        </h3>
                                      </div>
                                      <div className="gi-sb-block-content">
                                        <div className="gi-checkout-pay">
                                          {selectedAddress === null && (
                                            <div
                                              style={{ marginBottom: "15px" }}
                                              className="gi-pay-desc"
                                            >
                                              Please select the preferred
                                              Address to use on this order.
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <ul>
                                      {addressVisible.map((address, index) => (
                                        <li key={index}>
                                          <div
                                            style={{
                                              padding: "10px",
                                              background: "transparent",
                                              position: "relative",
                                            }}
                                            className="bill-box m-b-30"
                                          >
                                            <div>
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  top: "10px",
                                                  left: "10px",
                                                }}
                                                className="checkboxes__item"
                                              >
                                                <label className="checkbox style-c">
                                                  <input
                                                    value=""
                                                    type="checkbox"
                                                    checked={
                                                      selectedAddress != null &&
                                                      selectedAddress.id ===
                                                        address.id
                                                    }
                                                    onChange={() =>
                                                      handleSelectAddress(
                                                        address
                                                      )
                                                    }
                                                  />
                                                  <div className="checkbox__checkmark"></div>
                                                  <div className="checkbox__body"></div>
                                                </label>
                                              </div>
                                              <Row
                                                style={{ padding: "0 30px" }}
                                              >
                                                <Col
                                                  style={{ lineHeight: "25px" }}
                                                  lg={6}
                                                  md={6}
                                                  sm={12}
                                                >
                                                  <div className="gi-single-list">
                                                    <ul>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          Name :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.name}{" "}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          Email :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.email}{" "}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          Phone :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.phone}{" "}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          PostalCode :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.postal_code}
                                                        </span>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                </Col>
                                                <Col
                                                  style={{ lineHeight: "25px" }}
                                                  lg={6}
                                                  md={6}
                                                  sm={12}
                                                >
                                                  <div className="gi-single-list">
                                                    <ul>
                                                        <li>
                                                        <strong className="gi-check-subtitle">
                                                          Address :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.full_address}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          Country :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.country_name}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          State :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.district}
                                                        </span>
                                                      </li>
                                                      <li>
                                                        <strong className="gi-check-subtitle">
                                                          City :
                                                        </strong>{" "}
                                                        <span
                                                          style={{
                                                            color: "#777",
                                                          }}
                                                        >
                                                          {address.district}
                                                        </span>
                                                      </li>
                                                    </ul>
                                                  </div>
                                                </Col>
                                              </Row>

                                              {/* <div>
                                                <a
                                                  style={{
                                                    fontSize: "30px",
                                                    color: "#5caf90",
                                                    position: "absolute",
                                                    top: "0",
                                                    right: "10px",
                                                  }}
                                                  onClick={() =>
                                                    handleRemoveAddress(index)
                                                  }
                                                  href="#/"
                                                  className="remove"
                                                >
                                                  ×
                                                </a>
                                              </div> */}
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* <!--cart content End --> */}
              </Col>
              
              {/* <!-- Summary & Payment - Right Side (Desktop), Middle & Bottom (Mobile) --> */}
              <Col lg={4} md={12} className="gi-checkout-rightside order-2 order-lg-2">
                <div className="gi-sidebar-wrap">
                  {/* <!-- Sidebar Summary Block --> */}
                  <div className="gi-sidebar-block">
                    <div className="gi-sb-title">
                      <h3 className="gi-sidebar-title">Summary</h3>
                    </div>
                    <div className="gi-sb-block-content">
                      <div className="gi-checkout-summary">
                        <div>
                          <span className="text-left">Sub-Total</span>
                          <span className="text-right">
                            {subTotal.toFixed(2)} BDT
                          </span>
                        </div>
                        <div>
                          <span className="text-left">Delivery Charges</span>
                          <span className="text-right">Free</span>
                        </div>
                        <div>
                          <DiscountCoupon
                            subtotal={subTotal}
                            onDiscountApplied={handleDiscountApplied}
                          />
                        </div>
                        <div className="gi-checkout-summary-total">
                          <span className="text-left">Total Amount</span>
                          <span className="text-right">
                            {total.toFixed(2)} BDT
                          </span>
                        </div>
                      </div>
                      <div className="gi-checkout-pro">
                      <span className="text-left">Items</span>
                      {cartItems.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 0",
                              borderBottom: index < cartItems.length - 1 ? "1px solid #eee" : "none",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h6 style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                                {item.title} ({item.quantity}x)
                              </h6>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                {item.line_total.toFixed(2)} BDT
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* <!-- Sidebar Summary Block --> */}
                </div>
                
                <div className="gi-sidebar-wrap gi-checkout-pay-wrap">
                  {/* <!-- Sidebar Payment Block --> */}
                  <div className="gi-sidebar-block">
                    <div className="gi-sb-title">
                      <h3 className="gi-sidebar-title">Payment Method</h3>
                    </div>
                    <div className="gi-sb-block-content">
                      <div className="gi-checkout-pay">
                        <div className="gi-pay-desc">
                          Please select the preferred payment method to use on
                          this order.
                        </div>
                        <form action="#">
                          <span className="gi-pay-option">
                            <span>
                              <input
                                readOnly
                                type="radio"
                                id="pay1"
                                name="radio-group"
                                value=""
                                checked
                              />
                              <label htmlFor="pay1">Cash On Delivery</label>
                            </span>
                          </span>
                          <span className="gi-pay-commemt">
                            <span className="gi-pay-opt-head">
                              Add Comments About Your Order
                            </span>
                            <textarea
                              name="your-commemt"
                              placeholder="Comments"
                            ></textarea>
                          </span>
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* <!-- Place Order Button at bottom of Payment Section --> */}
                  {billingVisible && (
                    <div style={{ padding: "20px", textAlign: "right" }}>
                      <button
                        onClick={handleCheckout}
                        className="gi-btn-2"
                        disabled={isCheckoutDisabled() || checkoutLoading}
                        style={{
                          width: "100%",
                          opacity: isCheckoutDisabled() || checkoutLoading ? 0.6 : 1,
                          cursor: isCheckoutDisabled() || checkoutLoading ? "not-allowed" : "pointer",
                          position: "relative",
                        }}
                      >
                        {checkoutLoading ? (
                          <>
                            <Spinner /> Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </button>
                    </div>
                  )}
                  {/* <!-- Sidebar Payment Block --> */}
                </div>
              </Col>
            </Row>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckOut;

export const useLoadOrders = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginUser = JSON.parse(localStorage.getItem("login_user") || "{}");

      if (loginUser?.uid) {
        const storedOrders = JSON.parse(localStorage.getItem("orders") || "{}");
        const userOrders = storedOrders[loginUser.uid] || [];

        if (userOrders.length > 0) {
          dispatch(setOrders(userOrders));
        }
      }
    }
  }, [dispatch]);
};

export const useLoadLocalStorageData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load switch state from localStorage
      const switchState = JSON.parse(localStorage.getItem("switch") || "false");
      dispatch(setSwitchOn(switchState));
    }
  }, [dispatch]);
};
