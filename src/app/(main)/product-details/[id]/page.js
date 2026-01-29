import { Row } from 'react-bootstrap'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ProductPage from '@/components/product-page/ProductPage'
import RelatedProduct from '@/components/product-page/related-product/RelatedProduct'

const page = ({ params }) => {
    // Extract product ID from URL params
    const productId = params?.id;

    return (
        <>
            <Breadcrumb title={"Product Page"} />
            <section className="gi-single-product padding-tb-40">
                <div className="container">
                    <Row>
                        <ProductPage
                            productId={productId}
                            none={'none'}
                            lg={12}
                        />
                    </Row>
                </div>
            </section>
            <RelatedProduct productId={productId} />
        </>
    )
}

export default page
