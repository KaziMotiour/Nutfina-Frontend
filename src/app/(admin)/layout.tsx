"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { getCurrentUser } from "@/store/reducers/userSlice";
import { getAuthToken } from "@/utils/api";
import AdminLayout from "@/components/admin/AdminLayout";
import Spinner from "@/components/button/Spinner";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.user);
  const hasRedirected = useRef(false);
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    // Check for auth token first
    const token = getAuthToken();
    
    // If no token, redirect immediately without fetching
    if (!token) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/login");
      }
      return;
    }

    // Only fetch user once if we have a token and haven't fetched yet
    if (!user && !loading && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      dispatch(getCurrentUser() as any).catch(() => {
        // If fetch fails, redirect to login
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/login");
        }
      });
    }
  }, [dispatch, user, loading, router]);

  useEffect(() => {
    // Only check permissions after user fetch is complete
    if (!loading && hasFetchedUser.current && !hasRedirected.current) {
      if (!isAuthenticated || !user) {
        // Not authenticated, redirect to login
        hasRedirected.current = true;
        router.replace("/login");
        return;
      }
      
      if (!user.is_superuser) {
        // Not a superuser, redirect to home
        hasRedirected.current = true;
        router.replace("/home");
        return;
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // Check token first - if no token, don't show loading, just redirect
  const token = getAuthToken();
  if (!token) {
    return null; // Redirect will happen
  }

  // Show loading spinner while fetching user
  if (loading || (!user && !hasFetchedUser.current)) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        backgroundColor: "#f5f7fa"
      }}>
        <Spinner />
      </div>
    );
  }

  // If not authenticated or not superuser, don't render (redirect will happen)
  if (!isAuthenticated || !user || !user.is_superuser) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
