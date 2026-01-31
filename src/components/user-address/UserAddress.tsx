"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  getUserAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
  Address,
} from "@/store/reducers/userSlice";
import { Col, Row, Form, Button } from "react-bootstrap";
import Spinner from "../button/Spinner";
import { showSuccessToast, showErrorToast } from "../toast-popup/Toastify";
import useSWR from "swr";
import fetcher from "../fetcher-api/Fetcher";
import Link from "next/link";

interface Country {
  id: string;
  name: any;
  iso2: string;
}

const UserAddress = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user?.isAuthenticated ?? false
  );
  const addresses = useSelector((state: RootState) => state.user?.address ?? []);
  const defaultAddress = useSelector(
    (state: RootState) => state.user?.defaultAddress ?? null
  );
  const loading = useSelector((state: RootState) => state.user?.loading ?? false);
  const error = useSelector((state: RootState) => state.user?.error ?? null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [validated, setValidated] = useState(false);
  const [filteredCountryData, setFilteredCountryData] = useState<Country[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    full_address: "",
    country: "BD", // Default to Bangladesh
    district: "",
    postal_code: "",
    is_default: false,
  });

  const { data: country } = useSWR("/api/country", fetcher);

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

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserAddress());
      dispatch(getDefaultAddress());
    }
  }, [dispatch, isAuthenticated]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCountryChange = (e: any) => {
    handleInputChange(e);
  };

  const resetForm = () => {
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
    setEditingAddress(null);
    setShowForm(false);
    setValidated(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name || "",
      email: address.email || "",
      phone: address.phone || "",
      full_address: address.full_address || "",
      country: address.country || "",
      district: address.district || "",
      postal_code: address.postal_code || "",
      is_default: address.is_default || false,
    });
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.gi-vendor-card-body');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await dispatch(deleteAddress(id)).unwrap();
        showSuccessToast("Address deleted successfully!");
        
        // Refresh addresses and default address
        await Promise.all([
          dispatch(getUserAddress()),
          dispatch(getDefaultAddress()),
        ]);
      } catch (error: any) {
        showErrorToast(error || "Failed to delete address");
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      // Update the address to set is_default to true
      // First, unset any existing default address
      const currentDefault = addresses.find((addr) => addr.is_default);
      if (currentDefault && currentDefault.id !== id) {
        await dispatch(
          updateAddress({
            id: currentDefault.id,
            data: { is_default: false },
          })
        ).unwrap();
      }

      // Set the selected address as default
      await dispatch(
        updateAddress({
          id,
          data: { is_default: true },
        })
      ).unwrap();

      showSuccessToast("Default address updated successfully!");
      // Refresh addresses and default address
      await Promise.all([
        dispatch(getUserAddress()),
        dispatch(getDefaultAddress()),
      ]);
    } catch (error: any) {
      showErrorToast(error || "Failed to set default address");
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
    if (
      !formData.name ||
      !formData.phone ||
      !formData.full_address ||
      !formData.country ||
      !formData.district
    ) {
      setValidated(true);
      showErrorToast("Please fill in all required fields");
      return;
    }

    try {
      // If setting as default, first unset any existing default
      if (formData.is_default) {
        const currentDefault = addresses.find((addr) => addr.is_default);
        if (currentDefault && (!editingAddress || currentDefault.id !== editingAddress.id)) {
          await dispatch(
            updateAddress({
              id: currentDefault.id,
              data: { is_default: false },
            })
          ).unwrap();
        }
      }

      if (editingAddress) {
        // Update existing address
        const result = await dispatch(
          updateAddress({
            id: editingAddress.id,
            data: {
              name: formData.name.trim(),
              email: formData.email?.trim() || "",
              phone: formData.phone.trim(),
              full_address: formData.full_address.trim(),
              country: formData.country,
              district: formData.district.trim(),
              postal_code: formData.postal_code?.trim() || "",
              is_default: formData.is_default || false,
            },
          })
        ).unwrap();

        showSuccessToast("Address updated successfully!");
      } else {
        // Create new address
        const result = await dispatch(
          createAddress({
            name: formData.name.trim(),
            email: formData.email?.trim() || "",
            phone: formData.phone.trim(),
            full_address: formData.full_address.trim(),
            country: formData.country,
            district: formData.district.trim(),
            postal_code: formData.postal_code?.trim() || "",
            is_default: formData.is_default || false,
          })
        ).unwrap();

        showSuccessToast("Address created successfully!");
      }

      // Refresh addresses and default address
      await Promise.all([
        dispatch(getUserAddress()),
        dispatch(getDefaultAddress()),
      ]);

      resetForm();
    } catch (error: any) {
      if (typeof error === "string") {
        showErrorToast(error);
      } else if (error && typeof error === "object") {
        const errors = Object.values(error).flat().join(", ");
        showErrorToast(errors || "Failed to save address");
      } else {
        showErrorToast("Failed to save address. Please try again.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="gi-blog padding-tb-40">
        <div className="container">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>
              Please <Link href="/login">login</Link> or{" "}
              <Link href="/register">register</Link> to view your addresses.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style jsx>{`
        .address-card {
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .address-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .address-card-default {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        .form-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 32px;
          margin-top: 24px;
          border: 1px solid #e5e7eb;
        }
        .form-label-custom {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .form-control-custom {
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          transition: all 0.2s ease;
        }
        .form-control-custom:focus {
          border-color: #5caf90;
          box-shadow: 0 0 0 3px rgba(92, 175, 144, 0.1);
        }
        .btn-primary-custom {
          background: linear-gradient(135deg, #5caf90 0%, #469170 100%);
          border: none;
          color: #ffffff !important;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(92, 175, 144, 0.2);
        }
        .btn-primary-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(92, 175, 144, 0.4);
          background: linear-gradient(135deg, #469170 0%, #5caf90 100%);
        }
        .btn-primary-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary-custom {
          background: #ffffff;
          border: 2px solid #6b7280;
          color: #6b7280 !important;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-secondary-custom:hover:not(:disabled) {
          background: #6b7280;
          color: #ffffff !important;
          border-color: #6b7280;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.2);
        }
        .btn-secondary-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }
        .empty-state-icon {
          font-size: 64px;
          color: #d1d5db;
          margin-bottom: 16px;
        }
        .default-badge {
          background: linear-gradient(135deg, #5caf90 0%, #469170 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(92, 175, 144, 0.3);
        }
        .address-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #5caf90 0%, #469170 100%);
          color: white;
          font-size: 24px;
        }
        .address-info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 8px;
        }
        .address-info-item i {
          color: #5caf90;
          margin-top: 4px;
          min-width: 20px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        .action-btn {
          flex: 1;
          min-width: 90px;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .action-btn:hover {
          transform: translateY(-1px);
        }
        .btn-edit {
          background: linear-gradient(135deg, #5caf90 0%, #469170 100%);
          color: white;
        }
        .btn-edit:hover {
          box-shadow: 0 4px 12px rgba(92, 175, 144, 0.3);
        }
        .btn-default {
          background: #ffffff;
          border: 1.5px solid #5caf90;
          color: #5caf90;
        }
        .btn-default:hover {
          background: #f0fdf4;
        }
        .btn-delete {
          background: #ffffff;
          border: 1.5px solid #ef4444;
          color: #ef4444;
        }
        .btn-delete:hover {
          background: #fee2e2;
        }
      `}</style>
      <section className="gi-blog padding-tb-40">
        <div className="container">
          <Row>
            <Col lg={12}>
              <div className="gi-vendor-dashboard-card" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                <div className="gi-vendor-card-header" style={{ padding: "24px", borderBottom: "1px solid #e5e7eb", background: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                        <i className="fi-rr-map-marker" style={{ marginRight: "8px", color: "#5caf90" }}></i>
                        My Addresses
                      </h5>
                      <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                        Manage your delivery addresses
                      </p>
                    </div>
                    <div className="gi-header-btn">
                      <button
                        className="gi-btn-1"
                        onClick={() => {
                          if (showForm && !editingAddress) {
                            resetForm();
                          } else {
                            resetForm();
                            setShowForm(true);
                            setTimeout(() => {
                              const formElement = document.querySelector('.form-section');
                              if (formElement) {
                                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }
                        }}
                        style={{
                          background: "linear-gradient(135deg, #5caf90 0%, #469170 100%)",
                          border: "none",
                          padding: "10px 24px",
                          borderRadius: "8px",
                          color: "white",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(92, 175, 144, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <i className={`fi-rr-${showForm && !editingAddress ? "cross" : "plus"}`}></i>
                        {showForm && !editingAddress ? "Cancel" : "Add New Address"}
                      </button>
                    </div>
                  </div>
                </div>

                {loading && addresses.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Spinner />
                    <p style={{ marginTop: "20px", color: "#6b7280", fontSize: "16px" }}>Loading addresses...</p>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "16px 20px",
                      margin: "24px",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "8px",
                      border: "1px solid #fecaca",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >
                    <i className="fi-rr-exclamation-circle" style={{ fontSize: "20px" }}></i>
                    <span>{error}</span>
                  </div>
                )}

                {/* Address Form */}
                {showForm && (
                  <div className="form-section">
                    <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #5caf90 0%, #469170 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px"
                      }}>
                        <i className={`fi-rr-${editingAddress ? "edit" : "plus"}`}></i>
                      </div>
                      <div>
                        <h6 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
                          {editingAddress ? "Edit Address" : "Add New Address"}
                        </h6>
                        <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                          {editingAddress ? "Update your address information" : "Add a new delivery address"}
                        </p>
                      </div>
                    </div>
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={handleSubmit}
                    >
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-user" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Full Name <span style={{ color: "#ef4444" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              placeholder="Enter your full name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your name.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-envelope" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Email Address
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              placeholder="Enter your email (optional)"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-phone-call" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Phone Number <span style={{ color: "#ef4444" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              placeholder="Enter your phone number"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your phone number.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-globe" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Country <span style={{ color: "#ef4444" }}>*</span>
                            </Form.Label>
                            <Form.Select
                              name="country"
                              required
                              value={formData.country}
                              onChange={handleCountryChange}
                              isInvalid={validated && !formData.country}
                              className="form-control-custom"
                              style={{ padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #d1d5db" }}
                            >
                              <option value="" disabled>
                                Select Country
                              </option>
                              {filteredCountryData.map((country: any, index: number) => (
                                <option key={index} value={country.iso2}>
                                  {country.countryName}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              Please select a country.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-map-marker" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Full Address <span style={{ color: "#ef4444" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="full_address"
                              placeholder="Enter your full address"
                              required
                              value={formData.full_address}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your full address.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-building" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              District <span style={{ color: "#ef4444" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="district"
                              placeholder="Enter district"
                              required
                              value={formData.district}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter district.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              <i className="fi-rr-mailbox" style={{ marginRight: "6px", color: "#5caf90" }}></i>
                              Postal Code
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="postal_code"
                              placeholder="Enter postal code (optional)"
                              value={formData.postal_code}
                              onChange={handleInputChange}
                              className="form-control-custom"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-4">
                            <div style={{
                              padding: "16px",
                              background: formData.is_default ? "#f0fdf4" : "#f9fafb",
                              borderRadius: "8px",
                              border: `1.5px solid ${formData.is_default ? "#5caf90" : "#e5e7eb"}`,
                              transition: "all 0.2s ease"
                            }}>
                              <Form.Check
                                type="checkbox"
                                name="is_default"
                                label={
                                  <span style={{ fontWeight: "600", color: "#374151" }}>
                                    <i className="fi-rr-star" style={{ marginRight: "8px", color: "#5caf90" }}></i>
                                    Set as default address
                                  </span>
                                }
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                style={{ cursor: "pointer" }}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <div style={{ display: "flex", gap: "12px", marginTop: "32px", flexWrap: "wrap" }}>
                        <Button
                          type="submit"
                          className="btn-primary-custom"
                          disabled={loading}
                          style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          {loading ? (
                            <>
                              <Spinner /> {editingAddress ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            <>
                              <i className={`fi-rr-${editingAddress ? "check" : "plus"}`}></i>
                              {editingAddress ? "Update Address" : "Create Address"}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          className="btn-secondary-custom"
                          onClick={resetForm}
                          disabled={loading}
                          style={{ display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <i className="fi-rr-cross"></i>
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}

                {/* Address List */}
                {!showForm && (
                  <div className="gi-vendor-card-body" style={{ padding: "24px" }}>
                    {addresses.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <i className="fi-rr-map-marker"></i>
                        </div>
                        <h5 style={{ color: "#374151", marginBottom: "8px", fontSize: "20px", fontWeight: "600" }}>
                          No addresses yet
                        </h5>
                        <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>
                          Add your first address to get started with faster checkout
                        </p>
                        <button
                          className="gi-btn-1"
                          onClick={() => {
                            resetForm();
                            setShowForm(true);
                          }}
                          style={{
                            background: "linear-gradient(135deg, #5caf90 0%, #469170 100%)",
                            border: "none",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                          }}
                        >
                          <i className="fi-rr-plus"></i>
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      <Row>
                        {addresses.map((address: Address) => (
                          <Col key={address.id} md={6} lg={4} className="mb-4">
                            <div
                              className={`address-card ${address.is_default ? "address-card-default" : ""}`}
                              style={{
                                border: `2px solid ${address.is_default ? "#5caf90" : "#e5e7eb"}`,
                                borderRadius: "12px",
                                padding: "24px",
                                backgroundColor: address.is_default ? "#ffffff" : "#ffffff",
                                position: "relative",
                                height: "100%",
                                background: address.is_default 
                                  ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" 
                                  : "#ffffff",
                              }}
                            >
                              {address.is_default && (
                                <div className="default-badge" style={{ position: "absolute", top: "16px", right: "16px" }}>
                                  <i className="fi-rr-star" style={{ marginRight: "4px" }}></i>
                                  Default
                                </div>
                              )}
                              <div className="address-icon">
                                <i className="fi-rr-map-marker"></i>
                              </div>
                              <div style={{ marginBottom: "20px", paddingRight: address.is_default ? "80px" : "0" }}>
                                <h6
                                  style={{
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    marginBottom: "16px",
                                    color: "#1f2937",
                                  }}
                                >
                                  {address.name}
                                </h6>
                                <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.8" }}>
                                  <div className="address-info-item">
                                    <i className="fi-rr-map-marker"></i>
                                    <span>{address.full_address}</span>
                                  </div>
                                  <div className="address-info-item">
                                    <i className="fi-rr-building"></i>
                                    <span>
                                      {address.district}
                                      {address.postal_code ? `, ${address.postal_code}` : ""}
                                    </span>
                                  </div>
                                  <div className="address-info-item">
                                    <i className="fi-rr-globe"></i>
                                    <span>{address.country_name || address.country}</span>
                                  </div>
                                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                                    <div className="address-info-item">
                                      <i className="fi-rr-phone-call"></i>
                                      <span style={{ fontWeight: "600", color: "#374151" }}>{address.phone}</span>
                                    </div>
                                    {address.email && (
                                      <div className="address-info-item">
                                        <i className="fi-rr-envelope"></i>
                                        <span>{address.email}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="action-buttons">
                                <button
                                  className="action-btn btn-edit"
                                  onClick={() => handleEdit(address)}
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                  <i className="fi-rr-edit"></i>
                                  Edit
                                </button>
                                {!address.is_default && (
                                  <button
                                    className="action-btn btn-default"
                                    onClick={() => handleSetDefault(address.id)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                  >
                                    <i className="fi-rr-star"></i>
                                    Set Default
                                  </button>
                                )}
                                {!address.is_default && <button
                                  className="action-btn btn-delete"
                                  onClick={() => handleDelete(address.id)}
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                  <i className="fi-rr-trash"></i>
                                  Delete
                                </button>}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default UserAddress;
