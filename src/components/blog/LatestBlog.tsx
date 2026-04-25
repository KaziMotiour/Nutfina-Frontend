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
  const {
    homeLatestBlogs,
    homeLatestBlogsFetched,
    homeLatestBlogsLoading,
    homeLatestBlogsError,
  } = useSelector((state: RootState) => state.blog);

  // Fetch once per session (cached in Redux + persist). Skipped when `homeLatestBlogsFetched`.
  // `onSuccess`/`onError` omitted from deps (unstable default prop functions).
  useEffect(() => {
    dispatch(getBlogs({ limit: 10, ordering: "-published_at" })).then((action) => {
      if (getBlogs.fulfilled.match(action)) {
        onSuccess();
      } else if (
        getBlogs.rejected.match(action) &&
        !(action as { meta?: { condition?: boolean } }).meta?.condition
      ) {
        onError();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks intentionally omitted
  }, [dispatch]);

  const showLoading =
    homeLatestBlogsLoading ||
    (!homeLatestBlogsFetched && !homeLatestBlogsError);

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

  if (homeLatestBlogsError) {
    return (
      <section className="gi-blog-section padding-tb-40 wow fadeInUp">
        <div className="container">
          <div className="row m-b-minus-24px">
            <div className="section-title">
              <div className="section-detail">
                <h2 className="gi-title">
                  Latest <span>Blog</span>
                </h2>
              </div>
            </div>
            <div className="blog-message blog-message--error">
              <div className="blog-message__icon">
                <i className="fi-rr-info" aria-hidden />
              </div>
              <h3 className="blog-message__title">Oops, we hit a snag</h3>
              <p className="blog-message__text">
                Posts didn&apos;t load — maybe check your connection? Hit the button below and we&apos;ll try again.
              </p>
              <button
                type="button"
                className="blog-message__retry"
                onClick={() =>
                  dispatch(
                    getBlogs({
                      limit: 10,
                      ordering: "-published_at",
                      force: true,
                    })
                  )
                }
              >
                <i className="fi-rr-refresh" /> Give it another shot
              </button>
            </div>
          </div>
        </div>
        <style jsx>{`
          .blog-message {
            text-align: center;
            padding: 2rem 1.25rem;
            border-radius: 16px;
            margin-top: 1rem;
          }
          .blog-message--error {
            background: #f8f6f3;
            border: 1px solid #e8e4de;
          }
          .blog-message__icon {
            width: 52px;
            height: 52px;
            margin: 0 auto 0.75rem;
            border-radius: 50%;
            background: #eee9e2;
            color: #8b7355;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
          }
          .blog-message__title {
            font-size: 1.15rem;
            font-weight: 600;
            color: #4a4a4a;
            margin-bottom: 0.35rem;
          }
          .blog-message__text {
            color: #6b6b6b;
            margin-bottom: 1rem;
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          .blog-message__retry {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            background: #03492f;
            color: #fff;
            border: none;
            border-radius: 999px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.15s ease;
          }
          .blog-message__retry:hover {
            background: #023020;
            transform: scale(1.02);
          }
        `}</style>
      </section>
    );
  }

  if (showLoading) {
    return (
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
            </div>
            <div className="blog-message blog-message--loading">
              <Spinner />
              <p className="blog-message__text">Fetching latest posts...</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .blog-message--loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 2.5rem 1.5rem;
            margin-top: 1rem;
            background: #f8f6f3;
            border-radius: 16px;
            border: 1px solid #e8e4de;
          }
          .blog-message--loading .blog-message__text {
            color: #6b6b6b;
            font-size: 0.95rem;
            margin: 0;
          }
        `}</style>
      </section>
    );
  }

  if (!homeLatestBlogs || homeLatestBlogs.length === 0) {
    return (
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
            </div>
            <div className="blog-message blog-message--empty">
              <div className="blog-message__icon">
                <i className="fi-rr-document" aria-hidden />
              </div>
              <p className="blog-message__text">No posts yet — check back soon for updates.</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .blog-message--empty {
            text-align: center;
            padding: 2rem 1.25rem;
            margin-top: 1rem;
            background: #f8f6f3;
            border-radius: 16px;
            border: 1px solid #e8e4de;
          }
          .blog-message--empty .blog-message__icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 0.75rem;
            border-radius: 50%;
            background: #eee9e2;
            color: #8b7355;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
          }
          .blog-message--empty .blog-message__text {
            color: #6b6b6b;
            margin: 0;
            font-size: 0.95rem;
          }
        `}</style>
      </section>
    );
  }

  const blogData = homeLatestBlogs.map(transformBlogData);
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
                  slidesPerView: 2,
                  spaceBetween: 2,
                },
                425: {
                  slidesPerView: 2,
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
