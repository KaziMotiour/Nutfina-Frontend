"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getOrders, Order } from "../../store/reducers/orderSlice";
import TrackViewModal from "../model/TrackViewModal";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../button/Spinner";

const OrderPage = () => {
  const [show, setShow] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  // Get orders from Redux store
  const orders = useSelector((state: RootState) => state.order?.orders ?? []);
  const loading = useSelector((state: RootState) => state.order?.loading ?? false);
  const error = useSelector((state: RootState) => state.order?.error ?? null);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user?.isAuthenticated ?? false
  );

  // Fetch orders on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getOrders({})); // Empty params to get all orders, backend orders by -created by default
    }
  }, [dispatch, isAuthenticated]);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  // Format date helper
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

  // Get status class for styling
  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "out",
      confirmed: "avl",
      processing: "avl",
      shipped: "avl",
      delivered: "avl",
      cancelled: "out",
      refunded: "out",
      completed: "avl",
    };
    return statusMap[status?.toLowerCase()] || "out";
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  // Calculate total items in order
  const getTotalItemCount = (order: Order) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0;
  };

  // Get payment method
  const getPaymentMethod = (order: Order) => {
    if (order.payment && order.payment.method) {
      return order.payment.method.toUpperCase();
    }
    return "N/A";
  };

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="gi-faq padding-tb-40 gi-wishlist">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Product <span>Order List</span>
            </h2>
            <p>Please login to view your orders.</p>
          </div>
          <Row>
            <Col md={12}>
              <div className="text-center" style={{ padding: "40px" }}>
                <p>
                  Please <Link href="/login">login</Link> or{" "}
                  <Link href="/register">register</Link> to view your orders.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="gi-faq padding-tb-40 gi-wishlist">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Product <span>Order List</span>
            </h2>
            <p>Your product Order is our first priority.</p>
          </div>
          <Row>
            <Col md={12}>
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>All Orders</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="/shop-left-sidebar-col-3">
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="gi-vendor-card-body">
                  <div className="gi-vendor-card-table">
                    {loading ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <Spinner />
                        <p style={{ marginTop: "20px" }}>Loading orders...</p>
                      </div>
                    ) : error ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "red" }}>Error: {error}</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <table className="table gi-table">
                        <thead>
                          <tr>
                            <th scope="col">Orders ID</th>
                            <th scope="col">Payment Method</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Date</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={7} className="text-center">
                              <span style={{ display: "flow" }}>
                                No orders found
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="table gi-table">
                        <thead>
                          <tr>
                            <th scope="col">Orders ID</th>
                            <th scope="col">Payment Method</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Date</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody className="wish-empt">
                          {orders.map((order: Order) => (
                            <tr
                              key={order.id}
                              style={{ cursor: "pointer" }}
                              className="pro-gl-content"
                            >
                              <td scope="row">
                                <span>#{order.id}</span>
                              </td>
                              <td>
                                <span>{getPaymentMethod(order)}</span>
                              </td>
                              <td>
                                <span>{getTotalItemCount(order)}</span>
                              </td>
                              <td>
                                <span>{formatDate(order.placed_at || order.created)}</span>
                              </td>
                              <td>
                                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                              </td>
                              <td>
                                <span className={getStatusClass(order.status)}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </td>
                              <td>
                                <span className="avl">
                                  <Link
                                    href={`/orders/${order.id}`}
                                    style={{ padding: "20px 30px" }}
                                    className="gi-btn-2"
                                  >
                                    View
                                  </Link>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <TrackViewModal
        currentDate={new Date().toLocaleDateString("en-GB")}
        handleClose={handleClose}
        show={show}
      />
    </>
  );
};

export default OrderPage;
