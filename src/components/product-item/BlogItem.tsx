import Link from "next/link";
import React from "react";

function BlogItem({ data }) {
  const blogSlug = data.slug || data.id;
  const categorySlug = data.category?.slug || "";

  return (
    <>
      <figure className="blog-img">
        <Link href={`/blog-details/${blogSlug}`}>
          <img src={data.image} alt={data.title || "news image"} />
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
