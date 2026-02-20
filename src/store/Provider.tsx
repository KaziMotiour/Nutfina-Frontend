"use client";

import { Provider, useDispatch } from "react-redux";
import type { AppDispatch } from "./index";
import { store, persistor } from "./index";
import React, { useEffect, useRef } from "react";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate
import { logout } from "./reducers/userSlice";
import { getCart } from "./reducers/orderSlice";
import { TOKEN_EXPIRED_EVENT } from "@/utils/api";

// Component to handle token expiration
function TokenExpirationHandler({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleTokenExpiration = (event: CustomEvent) => {
      // Dispatch logout action to clear Redux state
      dispatch(logout());
      
      // Optional: You can add redirect logic here if needed
      // Example: window.location.href = "/login";
    };

    // Listen for token expiration events
    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpiration as EventListener);

    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpiration as EventListener);
    };
  }, [dispatch]);

  return <>{children}</>;
}

// Ensure cart is always synced once after app load/reload.
function CartBootstrapHandler({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    dispatch(getCart());
  }, [dispatch]);

  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CartBootstrapHandler>
          <TokenExpirationHandler>
            {children}
          </TokenExpirationHandler>
        </CartBootstrapHandler>
      </PersistGate>
    </Provider>
  );
}

export default Providers;
