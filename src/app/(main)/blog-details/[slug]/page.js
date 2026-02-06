"use client";
import { Row } from 'react-bootstrap'
import BlogDetail from "@/components/blog-detail/BlogDetail"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const page = () => {
    const params = useParams();
    const [slug, setSlug] = useState('');
    
    useEffect(() => {
        console.log('params', params);
        if (params?.slug) {
            console.log('params.slug', params.slug);
            // Handle both string and array (catch-all routes)
            const slugValue = Array.isArray(params.slug) ? params.slug[0] : params.slug;
            setSlug(slugValue);
        }
    }, [params]);

    return (
        <>
            <Breadcrumb title={"Blog Details"} />
            <section className="gi-blog padding-tb-40">
                <div className="container">
                    <Row>
                        <BlogDetail slug={slug} order={"order-lg-last order-md-first"} />
                    </Row>
                </div>
            </section>
        </>
    )
}

export default page
