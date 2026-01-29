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
      <section className="gi-blog padding-tb-40">
        <div className="container">
          <Row>
            <Col lg={12}>
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>My Addresses</h5>
                  <div className="gi-header-btn">
                    <button
                      className="gi-btn-1"
                      onClick={() => {
                        if (showForm && !editingAddress) {
                          resetForm();
                        } else {
                          resetForm();
                          setShowForm(true);
                          // Scroll to form
                          setTimeout(() => {
                            const formElement = document.querySelector('.gi-vendor-card-body');
                            if (formElement) {
                              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }
                      }}
                    >
                      {showForm && !editingAddress ? "Cancel" : "Add New Address"}
                    </button>
                  </div>
                </div>

                {loading && addresses.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spinner />
                    <p style={{ marginTop: "20px" }}>Loading addresses...</p>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "15px",
                      margin: "20px",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "6px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Address Form */}
                {showForm && (
                  <div className="gi-vendor-card-body" style={{ padding: "24px" }}>
                    <h6 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
                      {editingAddress ? "Edit Address" : "Add New Address"}
                    </h6>
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={handleSubmit}
                    >
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Name <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              placeholder="Enter your full name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your name.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              placeholder="Enter your email (optional)"
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Phone <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              placeholder="Enter your phone number"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your phone number.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Country <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Select
                              name="country"
                              required
                              value={formData.country}
                              onChange={handleCountryChange}
                              isInvalid={validated && !formData.country}
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
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Full Address <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="full_address"
                              placeholder="Enter your full address"
                              required
                              value={formData.full_address}
                              onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter your full address.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              District <span style={{ color: "red" }}>*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="district"
                              placeholder="Enter district"
                              required
                              value={formData.district}
                              onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                              Please enter district.
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              type="text"
                              name="postal_code"
                              placeholder="Enter postal code (optional)"
                              value={formData.postal_code}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              name="is_default"
                              label="Set as default address"
                              checked={formData.is_default}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <Button
                          type="submit"
                          className="gi-btn-1"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner /> {editingAddress ? "Updating..." : "Creating..."}
                            </>
                          ) : editingAddress ? (
                            "Update Address"
                          ) : (
                            "Create Address"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={resetForm}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </div>
                )}

                {/* Address List */}
                {!showForm && (
                  <div className="gi-vendor-card-body">
                    {addresses.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "#6b7280", fontSize: "16px" }}>
                          No addresses found. Add your first address to get started.
                        </p>
                      </div>
                    ) : (
                      <Row>
                        {addresses.map((address: Address) => (
                          <Col key={address.id} md={6} lg={4} className="mb-4">
                            <div
                              style={{
                                border: `2px solid ${
                                  address.is_default ? "#5caf90" : "#e5e7eb"
                                }`,
                                borderRadius: "8px",
                                padding: "20px",
                                backgroundColor: address.is_default ? "#f0fdf4" : "#ffffff",
                                position: "relative",
                                height: "100%",
                              }}
                            >
                              {address.is_default && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    backgroundColor: "#5caf90",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  Default
                                </div>
                              )}
                              <div style={{ marginBottom: "16px" }}>
                                <h6
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: "#1f2937",
                                  }}
                                >
                                  {address.name}
                                </h6>
                                <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
                                  <div style={{ marginBottom: "4px" }}>
                                    {address.full_address}
                                  </div>
                                  <div style={{ marginBottom: "4px" }}>
                                    {address.district}
                                    {address.postal_code ? `, ${address.postal_code}` : ""}
                                  </div>
                                  <div style={{ marginBottom: "8px" }}>
                                    {address.country_name || address.country}
                                  </div>
                                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                                    <div style={{ marginBottom: "4px" }}>
                                      <strong>Phone:</strong> {address.phone}
                                    </div>
                                    {address.email && (
                                      <div>
                                        <strong>Email:</strong> {address.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginTop: "16px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <button
                                  className="gi-btn-1"
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "14px",
                                    flex: "1",
                                    minWidth: "80px",
                                  }}
                                  onClick={() => handleEdit(address)}
                                >
                                  Edit
                                </button>
                                {!address.is_default && (
                                  <button
                                    className="gi-btn-2"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "14px",
                                      flex: "1",
                                      minWidth: "80px",
                                    }}
                                    onClick={() => handleSetDefault(address.id)}
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "14px",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    flex: "1",
                                    minWidth: "80px",
                                  }}
                                  onClick={() => handleDelete(address.id)}
                                >
                                  Delete
                                </button>
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
