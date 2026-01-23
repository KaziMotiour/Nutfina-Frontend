import { useEffect, useState } from "react";
import StarRating from "../stars/StarRating";
import QuickViewModal from "../model/QuickViewModal";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { showSuccessToast, showErrorToast } from "../toast-popup/Toastify";
import { RootState, AppDispatch } from "@/store";
import { addWishlist, removeWishlist } from "@/store/reducers/wishlistSlice";
import { addToCart, getCart } from "@/store/reducers/orderSlice";
// import { addCompare, removeCompareItem } from "@/store/reducers/compareSlice";
import SidebarCart from "../model/SidebarCart";

interface Item {
  id: number;
  variant_id: number;
  product_id: number;
  title: string;
  newPrice: number;
  waight: string;
  image: string;
  imageTwo: string;
  date: string;
  status: string;
  rating: number;
  oldPrice: number;
  location: string;
  brand: string;
  sku: number;
  category: string;
  quantity: number;
  sale: string;
}
const ItemCard = ({ data, showAddToCart = false }: any) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  // const compareItems = useSelector((state: RootState) => state.compare.compare);
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlist.wishlist
  );
  const cart = useSelector((state: RootState) => state.order.cart);
  const cartItems = cart?.items || [];

  // Check if item is in cart (by variant_id)
  const isItemInCart = (variantId: number) => {
    return cartItems.some((item: any) => item.variant === variantId || item.variant_detail?.id === variantId);
  };

  const handleCart = async (data: any) => {
    // Get variant_id from data
    // data.id might be variant_id, or we need to get it from variant_detail
    const variantId = data.variant_id || data.variant_detail?.id || data.id;
    
    if (!variantId) {
      showErrorToast("Product variant not found");
      return;
    }

    setIsAddingToCart(true);
    try {
      // addToCart already returns the full cart, so no need to call getCart again
      await dispatch(addToCart({ variant_id: variantId, quantity: 1 })).unwrap();
      showSuccessToast("Product added to cart successfully!");
    } catch (error: any) {
      showErrorToast(error || "Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isInWishlist = (data: Item) => {
    return wishlistItems.some((item: Item) => item.id === data.id);
  };

  const handleWishlist = (data: Item) => {
    if (!isInWishlist(data)) {
      dispatch(addWishlist(data));
      showSuccessToast("Add product in Wishlist Successfully!", {
        icon: false,
      });
    } else {
      dispatch(removeWishlist(data.id));
      showSuccessToast("Remove product on Wishlist Successfully!", {
        icon: false,
      });
      // showErrorToast("Item already have to wishlist");
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);
  // const isInCompare = (data: Item) => {
  //   return compareItems.some((item: Item) => item.id === data.id);
  // };

  // const handleCompareItem = (data: Item) => {
  //   if (!isInCompare(data)) {
  //     dispatch(addCompare(data));
  //     showSuccessToast(`Add product in Compare list Successfully!`, {
  //       icon: false,
  //     });
  //   } else {
  //     dispatch(removeCompareItem(data.id));
  //     showSuccessToast("Remove product on Compare list Successfully!", {
  //       icon: false,
  //     });
  //     // showErrorToast("Item already have to compare list");
  //   }
  // };

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <style jsx>{`
        .add-to-cart-btn:hover {
          background-color:rgb(70, 145, 112) !important;
          transition: background-color 0.3s ease;
        }
      `}</style>
      <div className="gi-product-content">
        <div className={` gi-product-inner`}>
          <div className="gi-pro-image-outer">
            <div className="gi-pro-image">
              <Link onClick={handleSubmit} href="/" className="image">
                <span className="label veg">
                  <span className="dot"></span>
                </span>
                <img className="main-image" src={data.image} alt="Product" />
                <img
                  className="hover-image"
                  src={data.imageTwo}
                  alt="Product"
                />
              </Link>
              <span className="flags">
                {data.sale && (
                  <span className={data.sale === "Sale" ? "sale" : "new"}>
                    {data.sale}
                  </span>
                )}
              </span>
              <div className="gi-pro-actions">
                <button
                  onClick={() => handleWishlist(data)}
                  className={
                    "gi-btn-group wishlist " +
                    (isInWishlist(data) ? "active" : "")
                  }
                  title="Wishlist"
                >
                  <i className="fi-rr-heart"></i>
                </button>
                <button
                  className="gi-btn-group quickview gi-cart-toggle"
                  data-link-action="quickview"
                  title="Quick view"
                  data-bs-toggle="modal"
                  data-bs-target="#gi_quickview_modal"
                  onClick={handleShow}
                >
                  <i className="fi-rr-eye"></i>
                </button>
                {/* <button
                  onClick={() => handleCompareItem(data)}
                  className="gi-btn-group quickview gi-cart-toggle"
                  data-link-action="quickview"
                  title="Compare"
                  data-bs-toggle="modal"
                  data-bs-target="#gi_quickview_modal"
                >
                  <i className="fi fi-rr-arrows-repeat"></i>
                </button> */}
                {/* <button
                  title="Add To Cart"
                  className="gi-btn-group add-to-cart"
                  onClick={() => handleCart(data)}
                >
                  <i className="fi-rr-shopping-basket"></i>
                </button> */}
              </div>
              <div className="gi-pro-option">
                {data.color1 && data.color2 && data.color3 && (
                  <ul className="colors">
                    {data.color1 && (
                      <li className={`color-${data.color1}`}>
                        <a href=""></a>
                      </li>
                    )}
                    {data.color2 && (
                      <li className={`color-${data.color2}`}>
                        <a href=""></a>
                      </li>
                    )}
                    {data.color3 && (
                      <li className={`color-${data.color3}`}>
                        <a href=""></a>
                      </li>
                    )}
                  </ul>
                )}
                {data.size1 && data.size2 && (
                  <ul className="sizes">
                    {data.size1 && (
                      <li>
                        <a href="">{data.size1}</a>
                      </li>
                    )}
                    {data.size2 && (
                      <li>
                        <a href="">{data.size2}</a>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="gi-pro-content">
            <Link href={`/product-details/${data.product_id}`}>
              <h6 className="gi-pro-stitle">{data.category}</h6>
            </Link>
            <h5 className="gi-pro-title">
              <Link href={`/product-details/${data.product_id}`}>{data.title}</Link>
            </h5>
            <p className="gi-info">
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC,
              making it over 2000 years old.
            </p>
            <div className="gi-pro-rat-price">
              <span className="gi-pro-rating">
                <StarRating rating={data.rating} />
                <span className="qty">{data.weight}</span>
              </span>
              <span className="gi-price">
                <div className="row">
                    <div className="col-12 mb-2">
                        <span className="new-price">${data.newPrice}.00</span>
                        <span className="old-price">${data.oldPrice}.00</span>
                    </div>
                    {showAddToCart && (
                      <div className="col-12 d-flex justify-content-center">
                        <button
                          title="Quick view"
                          className="gi-btn-group add-to-cart add-to-cart-btn border rounded p-2 w-100 w-sm-auto mt-2 mt-sm-0"
                          onClick={handleShow}
                          style={{ backgroundColor: '#5caf90', color: '#fff', opacity: 1 }}
                        >
                          <i className="fi-rr-eye"></i>
                          <span className="d-sm-inline"> Quick view</span>
                        </button>
                      </div>
                    )}
                </div>
              </span>
              
            </div>
          </div>
        </div>
        <QuickViewModal data={data} handleClose={handleClose} show={show} />
        <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
      </div>
    </>
  );
};

export default ItemCard;
