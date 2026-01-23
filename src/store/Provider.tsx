"use client";

import { Provider, useDispatch } from "react-redux";
import { store, persistor } from "./index";
import React, { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate
import { logout } from "./reducers/userSlice";
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

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TokenExpirationHandler>
          {children}
        </TokenExpirationHandler>
      </PersistGate>
    </Provider>
  );
}

export default Providers;
