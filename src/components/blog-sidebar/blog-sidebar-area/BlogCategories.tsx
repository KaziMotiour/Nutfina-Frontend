"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSelectedCategory } from "@/store/reducers/filterReducer";
import { getBlogCategories } from "@/store/reducers/blogSlice";
import Link from "next/link";
import Spinner from "@/components/button/Spinner";

const BlogCategories = ({ selectedCategory }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [showButton, setShowButton] = useState(false);
  const hasFetchedRef = useRef(false);
  
  const { categories, loading } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    // Only fetch if categories haven't been loaded yet
    // Check if categories are already in the store first
    if (categories.length > 0) {
      // Categories already loaded, mark as fetched to prevent refetch
      hasFetchedRef.current = true;
      return;
    }
    
    // Only fetch if we haven't already initiated a fetch and not currently loading
    if (!hasFetchedRef.current && !loading) {
      hasFetchedRef.current = true;
      dispatch(getBlogCategories() as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterBtn = () => {
    router.push("/blogs");
  };

  const handleCategoryChange = (categoryId: number) => {
    const updatedCategory = selectedCategory?.includes(categoryId)
      ? selectedCategory.filter((cat: number) => cat !== categoryId)
      : [...(selectedCategory || []), categoryId];
    dispatch(setSelectedCategory(updatedCategory));
  };

  if (loading) {
    return (
      <div className="gi-sidebar-block">
        <div className="gi-sb-title">
          <h3 className="gi-sidebar-title">Categories</h3>
        </div>
        <div className="gi-blog-block-content gi-sidebar-dropdown">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <!-- Sidebar Category Block --> */}
      <div className="gi-sidebar-block">
        <div className="gi-sb-title">
          <h3 className="gi-sidebar-title">Categories</h3>
        </div>
        <div className="gi-blog-block-content gi-sidebar-dropdown">
          {categories.length === 0 ? (
            <div className="text-muted">No categories found.</div>
          ) : (
            <ul>
              {categories.map((category: any) => (
                <li key={category.id}>
                  <div className="gi-sidebar-block-item">
                    <input
                      checked={selectedCategory?.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      type="checkbox"
                    />{" "}
                    <Link href={`/blogs?category=${category.slug}`}>
                      {category.name}
                      <span title="Blogs">- {category.blog_count || 0}</span>
                    </Link>
                    <span className="checked"></span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* <!-- Sidebar Category Block --> */}

      {showButton && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button onClick={handleFilterBtn} className="gi-btn-2">
            Filter
          </button>
        </div>
      )}
    </>
  );
};

export default BlogCategories;
