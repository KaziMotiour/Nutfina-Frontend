"use client";
import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import BlogItem from "../product-item/BlogItem";
import { Fade } from "react-awesome-reveal";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getBlogs } from "@/store/reducers/blogSlice";
import Spinner from "../button/Spinner";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

// Helper function to get backend base URL (without /api)
const getBackendBaseUrl = (): string => {
  const apiUrl = API_BASE_URL || "http://localhost:8000/api";
  // Remove /api from the end if present
  return apiUrl.replace(/\/api$/, "");
};

// Helper function to construct full image URL
const constructImageUrl = (imagePath: string | null | undefined): string => {
  const rawPath = (imagePath || "").trim();

  if (!rawPath) {
    return process.env.NEXT_PUBLIC_URL 
      ? `${process.env.NEXT_PUBLIC_URL}/assets/img/blog/placeholder.jpg`
      : "/assets/img/blog/placeholder.jpg";
  }

  // Already absolute URL
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  // Protocol-relative URL (e.g. //storage.googleapis.com/...)
  if (rawPath.startsWith("//")) {
    return `https:${rawPath}`;
  }

  // GCS URI format (e.g. gs://bucket/path/to/file.jpg)
  if (rawPath.startsWith("gs://")) {
    const gcsPath = rawPath.replace("gs://", "");
    return `https://storage.googleapis.com/${gcsPath}`;
  }

  // Bucket URL without protocol (e.g. storage.googleapis.com/bucket/file.jpg)
  if (rawPath.startsWith("storage.googleapis.com/")) {
    return `https://${rawPath}`;
  }

  // Build base host for relative media paths.
  // IMPORTANT: when API_BASE_URL is '/backend-api' (Next proxy), media still lives on backend host.
  const apiUrl = API_BASE_URL || "http://localhost:8000/api";
  const backendBaseUrl =
    apiUrl.startsWith("http://") || apiUrl.startsWith("https://")
      ? apiUrl.replace(/\/api\/?$/, "")
      : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Normalize duplicate slashes in final URL join.
  if (rawPath.startsWith("/")) {
    return `${backendBaseUrl}${rawPath}`;
  }

  return `${backendBaseUrl}/${rawPath}`;
};

const LatestBlog = ({
  onSuccess = () => { },
  hasPaginate = false,
  onError = () => { },
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    console.log("blogs", blogs);
    dispatch(getBlogs({ limit: 10, ordering: "-published_at" }))
      .then((result) => {
        if (getBlogs.fulfilled.match(result)) {
          onSuccess();
        }
      })
      .catch(() => {
        onError();
      });
  }, [dispatch]);


  useEffect(() => {
    // Fetch latest blogs (limit to 10, ordered by published_at)
    if (!loading && blogs.length === 0) {
      dispatch(getBlogs({ limit: 10, ordering: "-published_at" }))
        .then((result) => {
          if (getBlogs.fulfilled.match(result)) {
            onSuccess();
          }
        })
        .catch(() => {
          onError();
        });
    }
  }, [dispatch, loading, blogs.length, onSuccess, onError]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get first image URL or placeholder
  const getImageUrl = (blog: any) => {
    if (!blog.images || blog.images.length === 0) {
      return constructImageUrl(null);
    }
    
    const firstImage = blog.images[0];
    
    // Prioritize image_url (should be absolute URL from backend)
    if (firstImage.image_url) {
      return constructImageUrl(firstImage.image_url);
    }
    
    // Fallback to image field (might be relative)
    if (firstImage.image) {
      return constructImageUrl(firstImage.image);
    }
    
    // Fallback to placeholder
    return constructImageUrl(null);
  };

  // Get category name
  const getCategoryName = (blog: any) => {
    if (blog.category && blog.category.name) {
      return blog.category.name;
    }
    return "Uncategorized";
  };

  // Transform blog data to match BlogItem expected format
  const transformBlogData = (blog: any) => {
    return {
      id: blog.id,
      image: getImageUrl(blog),
      date: formatDate(blog.published_at || blog.created),
      name: getCategoryName(blog),
      title: blog.title || "",
      slug: blog.slug,
      category: blog.category,
    };
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#dc3545" }}>
        Failed to load blogs: {error}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        No blogs found.
      </div>
    );
  }

  const blogData = blogs.map(transformBlogData);
  return (
    <Fade triggerOnce direction="up">
      <section className="gi-blog-section padding-tb-40 wow fadeInUp">
        <div className="container">
          <div className="row m-b-minus-24px">
            <div className="section-title">
              <div className="section-detail">
                <h2 className="gi-title">
                  Latest <span>Blog</span>
                </h2>
                <p>We tackle interesting topics every day in 2023.</p>
              </div>
              <span className="title-link">
                <Link href="/blogs">
                  All Blogs<i className="fi-rr-angle-double-small-right"></i>
                </Link>
              </span>
            </div>
            <Swiper
              loop={true}
              autoplay={{ delay: 1000 }}
              slidesPerView={4}
              spaceBetween={25}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 0,
                },
                320: {
                  slidesPerView: 1,
                  spaceBetween: 2,
                },
                425: {
                  slidesPerView: 1,
                  spaceBetween: 2,
                },
                576: {
                  slidesPerView: 2,
                  spaceBetween: 2,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 2,
                },
                991: {
                  slidesPerView: 2,
                  spaceBetween: 2,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 2,
                },
                1200: {
                  slidesPerView: 4,
                  spaceBetween: 2,
                },
                1440: {
                  slidesPerView: 5,
                  spaceBetween: 2,
                },
              }}
              className="gi-blog-carousel owl-carousel"
            >
              <div className="gi-blog-item">
                {blogData.map((item: any, index: number) => (
                  <SwiperSlide
                    key={item.id || index}
                    style={{ padding: "0 12px", backgroundColor: "transparent", border: "none" }}
                    className="blog-info">
                    <BlogItem data={item} />
                  </SwiperSlide>
                ))}
              </div>
            </Swiper>
          </div>
        </div>
      </section>
    </Fade>
  );
};

export default LatestBlog;
