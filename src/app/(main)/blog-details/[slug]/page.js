import { Row } from 'react-bootstrap'
import BlogDetail from "@/components/blog-detail/BlogDetail"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'

const page = async ({ params }) => {
    const { slug } = await params;

    return (
        <>
            <Breadcrumb title={"Blog Details"} />
            <section className="gi-blog padding-tb-40">
                <div className="container">
                    <Row>
                        <BlogDetail slug={slug} />
                    </Row>
                </div>
            </section>
        </>
    )
}

export default page
