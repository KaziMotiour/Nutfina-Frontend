import Link from "next/link";
import React from "react";

function BlogItem({ data }) {
  const blogSlug = data.slug || data.id;
  const categorySlug = data.category?.slug || "";

  return (
    <>
      <figure
        className="blog-img"
        style={{
          margin: 0,
          overflow: "hidden",
          height: "220px",
          width: "100%",
        }}
      >
        <Link href={`/blog-details/${blogSlug}`} style={{ display: "block", height: "100%" }}>
          <img
            src={data.image}
            alt={data.title || "news image"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Link>
      </figure>
      <div className="detail">
        <label>
          {data.date} -{" "}
          {categorySlug ? (
            <Link href={`/blogs?category=${categorySlug}`}>
              {data.name}
            </Link>
          ) : (
            <span>{data.name}</span>
          )}
        </label>
        <h3>
          <Link href={`/blog-details/${blogSlug}`}>
            {data.title}
          </Link>
        </h3>
        <div className="more-info">
          <Link href={`/blog-details/${blogSlug}`}>
            Read More
            <i className="fi-rr-angle-double-small-right"></i>
          </Link>
        </div>
      </div>
    </>
  );
}

export default BlogItem;
