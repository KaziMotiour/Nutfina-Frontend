import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import UserInvoice from '@/components/invoice/UserInvoice'

export default async function Page({ params }) {
    const { orderId } = await params;
    
    return (
        <>
            <Breadcrumb title={"Invoice"} />
            <UserInvoice orderId={orderId} />
        </>
    )
}
