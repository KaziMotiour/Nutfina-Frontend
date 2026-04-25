  import { useEffect, useState } from "react";
  import QuickViewModal from "../model/QuickViewModal";
  import { useDispatch, useSelector } from "react-redux";
  import { useRouter } from "next/navigation";
  import { showSuccessToast, showErrorToast } from "../toast-popup/Toastify";
  import { RootState, AppDispatch } from "@/store";
  import { addWishlist, removeWishlist } from "@/store/reducers/wishlistSlice";
  import { addToCart } from "@/store/reducers/orderSlice";
  // import { addCompare, removeCompareItem } from "@/store/reducers/compareSlice";
  import SidebarCart from "../model/SidebarCart";

  interface Item {
    id: number;
    variant_id: number;
    slug: string;
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
    const router = useRouter();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [show, setShow] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const productHref = `/product-details/${data.slug}`;

    const goToProduct = () => {
      router.push(productHref);
    };

    const handleCardActivate = (e: React.MouseEvent | React.KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest(".item-card-no-nav")) return;
      goToProduct();
    };

    useEffect(() => {
      setImageLoaded(false);
    }, [data?.image]);
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
        const errorMessage = error?.message || error?.detail || error || "Failed to add product to cart";
        showErrorToast(errorMessage);
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


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
      <>
        <style jsx>{`
          .itemcard-image-wrap {
            position: relative;
            min-height: 220px;
            background: #f5f5f5;
          }
          .itemcard-image-wrap .image {
            display: block;
            min-height: 220px;
          }
          .itemcard-image-loader {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            z-index: 1;
          }
          .itemcard-image-wrap .main-image {
            transition: opacity 0.25s ease;
          }
          .itemcard-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #e8e8e8;
            border-top-color: #03492f;
            border-radius: 50%;
            animation: itemcard-spin 0.8s linear infinite;
          }
          @keyframes itemcard-spin {
            to { transform: rotate(360deg); }
          }
          .add-to-cart-btn:hover {
            background-color:rgb(70, 145, 112) !important;
            transition: background-color 0.3s ease;
          }
          .item-price-link {
            display: inline-block;
            width: 100%;
          }
          .item-price-wrap {
            display: inline-flex;
            align-items: baseline;
            gap: 8px;
            flex-wrap: nowrap;
            line-height: 1.2;
          }
          .item-price-wrap .new-price,
          .item-price-wrap .old-price {
            white-space: nowrap;
          }
          @media (max-width: 575.98px) {
            .item-price-wrap {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 4px;
            }
          }
          .item-card-clickable {
            cursor: pointer;
          }
        `}</style>
        <div className="gi-product-content">
          <div
            className="gi-product-inner item-card-clickable"
            role="link"
            tabIndex={0}
            aria-label={`View product: ${data.title ?? "product"}`}
            onClick={handleCardActivate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardActivate(e);
              }
            }}
          >
            <div className="gi-pro-image-outer">
              <div className="gi-pro-image itemcard-image-wrap">
                {!imageLoaded && (
                  <div className="itemcard-image-loader" aria-hidden>
                    <span className="itemcard-spinner" />
                  </div>
                )}
                <div className="image">
                  <span className="label veg">
                    <span className="dot"></span>
                  </span>
                  <img
                    className="main-image"
                    src={data.image}
                    alt=""
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                  />
                  <img
                    className="hover-image"
                    src={data.imageTwo}
                    alt=""
                  />
                </div>
                <span className="flags">
                  {data.sale && (
                    <span className={data.sale === "Sale" ? "sale" : "new"}>
                      {data.sale}
                    </span>
                  )}
                </span>
                <div className="gi-pro-actions item-card-no-nav">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist(data);
                    }}
                    className={
                      "gi-btn-group wishlist " +
                      (isInWishlist(data) ? "active" : "")
                    }
                    title="Wishlist"
                  >
                    <i className="fi-rr-heart"></i>
                  </button>
                  <button
                    type="button"
                    className="gi-btn-group quickview gi-cart-toggle"
                    data-link-action="quickview"
                    title="Quick view"
                    data-bs-toggle="modal"
                    data-bs-target="#gi_quickview_modal"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShow();
                    }}
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
                  {/* {data.color1 && data.color2 && data.color3 && (
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
                  )} */}
                </div>
              </div>
            </div>
            <div className="gi-pro-content">
                <h6 className="gi-pro-stitle">
                    {data.category}
                </h6>
                <h5 className="gi-pro-title">
                    {data.title}
                </h5>
                <div className="gi-pro-rat-price">
                  <span className="qty" style={{ fontSize: '14px', color: '#000000' }}>
                      {data.weight}
                    </span>
                  <span className="gi-pro-rating">
                    {/* <StarRating rating={data.rating} /> */}
                  </span>
                  <span className="gi-price">
                    <span className="item-price-link">
                      <div className="item-price-wrap mb-2">
                        <span className="new-price">{data.newPrice}.00 BDT</span>
                        {data.sale && <span className="old-price">{data.oldPrice}.00 BDT</span>}
                      </div>
                    </span>
                  </span>
                </div>
            </div>
            {showAddToCart && (
                <div className="col-12 d-flex justify-content-center p-2 item-card-no-nav">
                  <button
                    type="button"
                    title="Quick view"
                    className="gi-btn-group add-to-cart add-to-cart-btn border rounded p-2 w-100 w-sm-auto mt-2 mt-sm-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShow();
                    }}
                    style={{ backgroundColor: '#5caf90', color: '#fff', opacity: 1 }}
                  >
                    <i className="fi-rr-eye"></i>
                    <span className="d-sm-inline"> Quick view</span>
                  </button>
                </div>
              )}
          </div>
          <QuickViewModal data={data} handleClose={handleClose} show={show} />
          <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
        </div>
      </>
    );
  };

  export default ItemCard;
