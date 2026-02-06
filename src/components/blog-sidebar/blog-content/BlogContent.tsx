import React from "react";
import { Col } from "react-bootstrap";
import Link from "next/link";

const BlogContent = ({md, data, lg}: any) => {
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get first image or placeholder
  const getImageUrl = () => {
    if (data.images && data.images.length > 0 && data.images[0].image_url) {
      return data.images[0].image_url;
    }
    return process.env.NEXT_PUBLIC_URL + "/assets/img/blog/placeholder.jpg";
  };

  // Get category name
  const getCategory = () => {
    if (data.category && data.category.name) {
      return data.category.name;
    }
    return "Uncategorized";
  };

  // Get category slug for filtering
  const getCategorySlug = () => {
    if (data.category && data.category.slug) {
      return data.category.slug;
    }
    return "";
  };

  return (
    <>
        <Col md={md} sm={12} lg={lg} className="mb-6 gi-blog-block">
          <div className="gi-blog-item">
            <div className="blog-info">
              <figure className="blog-img">
                <Link href={`/blog-details/${data.slug}`}>
                  <img src={getImageUrl()} alt={data.title || "blog image"} />
                </Link>
              </figure>
              <div className="detail">
                <label>
                  {formatDate(data.published_at || data.created)} -{" "}
                  {data.category ? (
                    <Link href={`/blogs?category=${getCategorySlug()}`}>
                      {getCategory()}
                    </Link>
                  ) : (
                    <span>Uncategorized</span>
                  )}
                </label>
                <h3>
                  <Link href={`/blog-details/${data.slug}`}>
                    {data.title}
                  </Link>
                </h3>
                <p className="text-length">
                  {data.excerpt || data.content?.substring(0, 150) + "..." || ""}
                </p>
                {data.tags && data.tags.length > 0 && (
                  <div className="blog-tags mb-2">
                    {data.tags.slice(0, 3).map((tag: any, index: number) => (
                      <span key={tag.id || index} className="badge bg-secondary me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                        {tag.name}
                      </span>
                    ))}
                    {data.tags.length > 3 && (
                      <span className="badge bg-light text-dark me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                        +{data.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="more-info">
                  <Link href={`/blog-details/${data.slug}`}>
                    Read More<i className="gicon gi-angle-double-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Col>

    </>
  );
};

export default BlogContent;
