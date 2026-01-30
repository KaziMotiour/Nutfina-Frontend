"use client";
import { useEffect } from "react";
import HeaderManu from "./header/HeaderManu";
import HeaderOne from "./header/HeaderOne";
import HeaderTwo from "./header/HeaderTwo";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getCart } from "@/store/reducers/orderSlice";
import FeatureTools from "@/theme/ThemeSwitcher";

function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.order.cart);
  const wishlistItems = useSelector(
    (state: RootState) => state.wishlist.wishlist
  );

  // Fetch cart on mount and when cart changes
  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Get cart item count from backend
  const cartItemCount = cart?.item_count || cart?.items?.length || 0;

  return (
    <>
      {/* <Loader /> */}

      <header className="gi-header">
        <FeatureTools />
        {/* <HeaderOne wishlistItems={wishlistItems} cartItemCount={cartItemCount} /> */}
        <HeaderTwo cartItemCount={cartItemCount} wishlistItems={wishlistItems} />
        <HeaderManu />
      </header>
    </>
  );
}

export default Header;
