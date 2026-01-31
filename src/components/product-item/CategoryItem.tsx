import Link from "next/link";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";


const CategoryItem = ({ data }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // const isActive = currentCategory === data.categoryName;
  }, [searchParams]);

  return (
    <Link href={`/products/?category=${data.categoryName}`}>
      <div className="gi-cat-icon">
        <span className="gi-lbl">{data.persantine}</span>
        {/* <i className={data.icon}></i> */}
        <img 
          src={data.image} 
          alt={data.name}
          style={{ 
            filter: 'brightness(0) saturate(100%) invert(68%) sepia(42%) saturate(445%) hue-rotate(101deg) brightness(92%) contrast(89%)'
          }}
        />
        <div className="gi-cat-detail">
          
            <h4 className="gi-cat-title">{data.name}</h4>
          {/* <p className="items">{data.item} Items</p> */}
        </div>
      </div>
    </Link>

  );
};

export default CategoryItem;
