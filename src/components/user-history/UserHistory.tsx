"use client";
import { useEffect } from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getOrders, Order } from "../../store/reducers/orderSlice";
import VendorSidebar from "../vendor-sidebar/VendorSidebar";
import Spinner from "../button/Spinner";
import Link from "next/link";

const UserHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const login = useSelector(
    (state: RootState) => state.user?.isAuthenticated ?? false
  );
  const orders = useSelector((state: RootState) => state.order?.orders ?? []);
  const loading = useSelector((state: RootState) => state.order?.loading ?? false);
  const error = useSelector((state: RootState) => state.order?.error ?? null);
  
  useEffect(() => {
    if (login) {
      dispatch(getOrders({}));
    }
  }, [dispatch, login]);

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

  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const getTotalItemCount = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      return totalQuantity;
    }
    return 0;
  };

  if (!login) {
    return (
      <div className="container">
        <p>
          Please <Link href="/login">login</Link> or <Link href="/register">register</Link>{" "}
          to view this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="gi-vendor-dashboard padding-tb-40">
        <div className="container">
          <Row className="mb-minus-24px">
            <VendorSidebar />
            <div className="col-lg-9 col-md-12 mb-24">
              <div className="gi-vendor-dashboard-card">
                <div className="gi-vendor-card-header">
                  <h5>Order History</h5>
                  <div className="gi-header-btn">
                    <Link className="gi-btn-2" href="#">
                      View All
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
                      <div style={{ padding: "20px", color: "red" }}>
                        <p>Error loading orders: {error}</p>
                      </div>
                    ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                      <table className="table gi-vender-table">
                        <thead>
                          <tr>
                            <th scope="col">Order ID</th>
                            <th scope="col">Shipping Cost</th>
                            <th scope="col">Total Item Count</th>
                            <th scope="col">Date</th>
                            <th scope="col">Total Price</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="wish-empt">
                          {orders.map((order: Order) => (
                            <tr key={order.id} className="pro-gl-content">
                              <td scope="row">
                                <span>#{order.id}</span>
                              </td>
                              <td>
                                <span>
                                  <strong>${parseFloat(order.shipping_fee || "0").toFixed(2)}</strong>
                                </span>
                              </td>
                              <td>
                                <span>
                                  <strong>{getTotalItemCount(order)}</strong>
                                </span>
                              </td>
                              <td>
                                <span>{formatDate(order.placed_at)}</span>
                              </td>
                              <td>
                                <span>
                                  <strong>${parseFloat(order.total_amount).toFixed(2)}</strong>
                                </span>
                              </td>
                              <td>
                                <span className={getStatusClass(order.status)}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </td>
                              <td>
                                <span>
                                  <Link
                                    className="gi-btn-2"
                                    href={`/orders/${order.id}`}
                                  >
                                    View Details
                                  </Link>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : !loading ? (
                      <div style={{ padding: "40px", textAlign: "center" }}>
                        <p>You have no orders yet!</p>
                        <Link href="/home" className="gi-btn-1" style={{ marginTop: "20px", display: "inline-block" }}>
                          Start Shopping
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </Row>
        </div>
      </section>
    </>
  );
};

export default UserHistory;
