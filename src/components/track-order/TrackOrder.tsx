"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getOrder, Order } from "@/store/reducers/orderSlice";
import Spinner from "../button/Spinner";
import { useSearchParams, useRouter } from "next/navigation";

const TrackOrder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const order = useSelector((state: RootState) => state.order?.currentOrder);
  const loading = useSelector((state: RootState) => state.order?.loading ?? false);
  const error = useSelector((state: RootState) => state.order?.error ?? null);

  // Get order number from URL
  const urlOrderNumber = searchParams.get("order") || searchParams.get("order_number") || "";

  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);

  // Sync order number from URL and fetch order if exists
  useEffect(() => {
    if (urlOrderNumber && urlOrderNumber.trim()) {
      const trimmedOrderNumber = urlOrderNumber.trim();
      setOrderNumber(trimmedOrderNumber);
      setSearched(true);
      dispatch(getOrder(trimmedOrderNumber));
    } else {
      // Clear state if no order number in URL
      setOrderNumber("");
      setSearched(false);
    }
  }, [urlOrderNumber, dispatch]);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      return;
    }
    setSearched(true);
    
    // Update URL with order number
    const params = new URLSearchParams();
    params.set("order", orderNumber.trim());
    router.push(`/track-order?${params.toString()}`);
    
    // Fetch order
    dispatch(getOrder(orderNumber.trim()));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Map order status to progress step
  const getProgressStep = (status: string | undefined): number => {
    if (!status) return 0;
    const statusMap: Record<string, number> = {
      pending: 0,      // Step 0: Order placed, waiting for confirmation
      confirmed: 1,    // Step 1: Order confirmed
      processing: 2,   // Step 2: Processing order
      shipped: 3,      // Step 3: Product dispatched
      delivered: 4,    // Step 4: Product delivered
      completed: 5,    // Step 4: Order completed (same as delivered)
      cancelled: -1,   // Special state for cancelled orders
      refunded: -1,    // Special state for refunded orders
    };
    return statusMap[status.toLowerCase()] ?? 0;
  };

  const getProgressPercentage = (step: number): number => {
    if (step < 0) return 0; // Cancelled/refunded orders
    return (step / 4) * 100;
  };

  // Check if order is in a terminal state (cancelled/refunded)
  const isTerminalState = (status: string | undefined): boolean => {
    if (!status) return false;
    const terminalStates = ['cancelled', 'refunded'];
    return terminalStates.includes(status.toLowerCase());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const calculateExpectedDate = (placedAt: string | null): string => {
    if (!placedAt) return "N/A";
    try {
      const date = new Date(placedAt);
      // Add 5-7 business days for expected delivery
      date.setDate(date.getDate() + 7);
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const progressStep = order ? getProgressStep(order.status) : 0;
  const progressPercentage = getProgressPercentage(progressStep);
  const isTerminal = order ? isTerminalState(order.status) : false;
  
  // Helper function to determine step state and colors
  // stepIndex: 1=confirmed, 2=processing, 3=dispatched, 4=out for delivery
  const getStepState = (stepIndex: number) => {
    if (isTerminal) {
      return 'gi-step-cancelled'; // Special styling for cancelled/refunded
    }
    // When progressStep is 0 (pending), no step should be highlighted
    if (progressStep === 0) {
      return ''; // All steps are pending, no active state
    }
    // For step 1 (confirmed): completed when progressStep >= 1, active when progressStep === 1
    if (stepIndex === 1) {
      if (progressStep >= 1) return 'gi-step-completed';
      return '';
    }
    // For other steps: completed when progressStep > stepIndex, active when progressStep === stepIndex
    if (progressStep > stepIndex) {
      return 'gi-step-completed'; // Step is completed
    }
    if (progressStep === stepIndex) {
      return 'gi-step-active'; // Step is currently active
    }
    return ''; // Step is pending
  };

  // Get color for step based on state
  const getStepColor = (stepIndex: number) => {
    if (isTerminal) {
      return {
        icon: '#ef4444',      // Red for cancelled
        background: '#fee2e2', // Light red background
        border: '#ef4444',     // Red border
        text: '#991b1b'        // Dark red text
      };
    }
    
    // Special handling for step 5 (delivered)
    if (stepIndex === 5) {
      if (progressStep >= 5) {
        return {
          icon: '#10b981',      // Green for completed
          background: '#d1fae5', // Light green background
          border: '#10b981',     // Green border
          text: '#065f46'        // Dark green text
        };
      }
      return {
        icon: '#9ca3af',        // Gray for pending
        background: '#f3f4f6',  // Light gray background
        border: '#d1d5db',      // Gray border
        text: '#6b7280'         // Gray text
      };
    }
    
    const state = getStepState(stepIndex);
    
    if (state === 'gi-step-completed') {
      return {
        icon: '#10b981',      // Green for completed
        background: '#d1fae5', // Light green background
        border: '#10b981',     // Green border
        text: '#065f46'        // Dark green text
      };
    }
    
    if (state === 'gi-step-active') {
      return {
        icon: '#3b82f6',      // Blue for active
        background: '#dbeafe', // Light blue background
        border: '#3b82f6',     // Blue border
        text: '#1e40af'        // Dark blue text
      };
    }
    
    // Pending state (including when progressStep is 0)
    return {
      icon: '#9ca3af',        // Gray for pending
      background: '#f3f4f6',  // Light gray background
      border: '#d1d5db',      // Gray border
      text: '#6b7280'         // Gray text
    };
  };

  return (
    <>
      <section className="gi-track padding-tb-40">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Track<span> Order</span>
            </h2>
            <p>We delivering happiness and needs, Faster than you can think.</p>
          </div>
          <div className="row">
            <div className="container">
              {/* Search Input */}
              <div style={{ marginBottom: "30px", maxWidth: "600px", margin: "0 auto 30px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="Enter Order Number (e.g., ORD-20250101-00001)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      fontSize: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      outline: "none",
                    }}
                    className="form-control"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || !orderNumber.trim()}
                    className="gi-btn-1"
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      opacity: loading || !orderNumber.trim() ? 0.6 : 1,
                      cursor: loading || !orderNumber.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Searching..." : "Track"}
                  </button>
                </div>
                {error && searched && (
                  <div style={{ marginTop: "12px", color: "#ef4444", fontSize: "14px" }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Order Details */}
              {loading && searched && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spinner />
                  <p style={{ marginTop: "20px" }}>Loading order details...</p>
                </div>
              )}

              {!loading && order && searched && (
                <div className="gi-track-box">
                  {/* Order Details Cards */}
                  <div className="row">
                    <div className="col-md-3 col-sm-6 m-b-767">
                      <div className="gi-track-card">
                        <span className="gi-track-title">Order Number</span>
                        <span>{order.order_number || `#${order.id}`}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 m-b-767">
                      <div className="gi-track-card">
                        <span className="gi-track-title">Order Date</span>
                        <span>{formatDate(order.placed_at || order.created)}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 m-b-767">
                      <div className="gi-track-card">
                        <span className="gi-track-title">Expected Date</span>
                        <span>{calculateExpectedDate(order.placed_at || order.created)}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 m-b-767">
                      <div className="gi-track-card">
                        <span className="gi-track-title">Order Status</span>
                        <span style={{ 
                          textTransform: "capitalize",
                          color: isTerminal ? "#ef4444" : progressStep >= 4 ? "#10b981" : "#3b82f6",
                          fontWeight: "600"
                        }}>
                          {order.status?.replace('_', ' ') || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "30px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "20px" }}>
                      Order Progress
                    </h3>
                  </div>
                  <div>
                    <div className="gi-steps-body">
                      {/* Step 1: Order Confirmed */}
                      {(() => {
                        const colors = getStepColor(1);
                        const state = getStepState(1);
                        return (
                          <div 
                            className={`gi-step ${state}`}
                            style={{
                              backgroundColor: colors.background,
                              borderRadius: '12px',
                              padding: '16px 12px',
                            }}
                          >
                            {progressStep >= 1 && !isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon, backgroundColor: colors.background }}>
                                <i className="fa fa-check" aria-hidden="true"></i>
                              </span>
                            )}
                            {isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon }}>
                                <i className="fa fa-times" aria-hidden="true"></i>
                              </span>
                            )}
                            <span className="gi-step-icon" style={{ color: colors.icon }}>
                              <i className="fi fi-rs-comment-check"></i>
                            </span>
                            <span style={{ color: colors.text, fontWeight: state === 'gi-step-active' ? '600' : '500' }}>
                              Order<br></br> confirmed
                            </span>
                          </div>
                        );
                      })()}

                      {/* Step 2: Processing Order */}
                      {(() => {
                        const colors = getStepColor(2);
                        const state = getStepState(2);
                        return (
                          <div 
                            className={`gi-step ${state}`}
                            style={{
                              backgroundColor: colors.background,
                              padding: '16px 12px',
                              borderRadius: '12px',
                            }}
                          >
                            {progressStep >= 2 && !isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon }}>
                                <i className="fa fa-check" aria-hidden="true"></i>
                              </span>
                            )}
                            {isTerminal && progressStep < 2 && (
                              <span className="gi-step-indicator" style={{ opacity: 0.3, color: colors.icon }}>
                                <i className="fa fa-circle" aria-hidden="true"></i>
                              </span>
                            )}
                            <span className="gi-step-icon" style={{ color: colors.icon }}>
                              <i className="fi fi-rs-settings"></i>
                            </span>
                            <span style={{ color: colors.text, fontWeight: state === 'gi-step-active' ? '600' : '500' }}>
                              Processing<br></br> order
                            </span>
                          </div>
                        );
                      })()}

                      {/* Step 3: Product Dispatched */}
                      {(() => {
                        const colors = getStepColor(3);
                        const state = getStepState(3);
                        return (
                          <div 
                            className={`gi-step ${state}`}
                            style={{
                              backgroundColor: colors.background,
                              borderRadius: '12px',
                              padding: '16px 12px',
                             
                            }}
                          >
                            {progressStep >= 3 && !isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon }}>
                                <i className="fa fa-check" aria-hidden="true"></i>
                              </span>
                            )}
                            {isTerminal && progressStep < 3 && (
                              <span className="gi-step-indicator" style={{ opacity: 0.3, color: colors.icon }}>
                                <i className="fa fa-circle" aria-hidden="true"></i>
                              </span>
                            )}
                            <span className="gi-step-icon" style={{ color: colors.icon }}>
                              <i className="fi fi-rs-gift"></i>
                            </span>
                            <span style={{ color: colors.text, fontWeight: state === 'gi-step-active' ? '600' : '500' }}>
                              Product<br></br> dispatched
                            </span>
                          </div>
                        );
                      })()}

                      {/* Step 4: Out for Delivery */}
                      {(() => {
                        const colors = getStepColor(4);
                        const state = getStepState(4);
                        return (
                          <div 
                            className={`gi-step ${state}`}
                            style={{
                              backgroundColor: colors.background,
                              borderRadius: '12px',
                              padding: '16px 12px',

                            }}
                          >
                            {progressStep >= 4 && !isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon }}>
                                <i className="fa fa-check" aria-hidden="true"></i>
                              </span>
                            )}
                            {isTerminal && progressStep < 4 && (
                              <span className="gi-step-indicator" style={{ opacity: 0.3, color: colors.icon }}>
                                <i className="fa fa-circle" aria-hidden="true"></i>
                              </span>
                            )}
                            <span className="gi-step-icon" style={{ color: colors.icon }}>
                              <i className="fi fi-rs-truck-side"></i>
                            </span>
                            <span style={{ color: colors.text, fontWeight: state === 'gi-step-active' ? '600' : '500' }}>
                              Out for<br></br> delivery
                            </span>
                          </div>
                        );
                      })()}

                      {/* Step 5: Product Delivered (Final Step) */}
                      {(() => {
                        const step5State = progressStep >= 4 && !isTerminal ? "gi-step-completed" : progressStep === 4 ? "gi-step-active" : isTerminal ? "gi-step-cancelled" : "";
                        const colors = getStepColor(5);
                        return (
                          <div 
                            className={`gi-step ${step5State}`}
                            style={{
                              backgroundColor: colors.background,
                              
                              borderRadius: '12px',
                              padding: '16px 12px',
                            }}
                          >
                            {progressStep >= 4 && !isTerminal && (
                              <span className="gi-step-indicator" style={{ color: colors.icon }}>
                                <i className="fa fa-check" aria-hidden="true"></i>
                              </span>
                            )}
                            {isTerminal && (
                              <span className="gi-step-indicator" style={{ opacity: 0.3, color: colors.icon }}>
                                <i className="fa fa-circle" aria-hidden="true"></i>
                              </span>
                            )}
                            <span className="gi-step-icon" style={{ color: colors.icon }}>
                              <i className="fi fi-rs-home"></i>
                            </span>
                            <span style={{ color: colors.text, fontWeight: step5State === 'gi-step-active' ? '600' : '500' }}>
                              Product<br></br> delivered
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="gi-steps-header">
                      <div className="progress" style={{ 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ 
                            width: `${progressPercentage}%`,
                            height: '100%',
                            backgroundColor: isTerminal 
                              ? '#ef4444' 
                              : progressStep >= 4 
                                ? '#10b981' 
                                : '#3b82f6',
                            transition: 'width 0.5s ease, background-color 0.3s ease',
                            borderRadius: '4px'
                          }}
                          aria-valuenow={progressPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <div style={{ 
                        marginTop: '12px', 
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {isTerminal 
                          ? 'Order Cancelled/Refunded' 
                          : progressStep >= 4 
                            ? 'Order Completed' 
                            : `${Math.round(progressPercentage)}% Complete`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Initial State - No Search Yet */}
              {!searched && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>📦</div>
                  <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "10px" }}>
                    Track Your Order
                  </h3>
                  <p style={{ fontSize: "14px" }}>
                    Enter your order number above to track the status of your order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TrackOrder;
