import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import UserAddress from '@/components/user-address/UserAddress'

const page = () => {
    return (
        <>
            <Breadcrumb title={"My Addresses"} />
            <UserAddress />
        </>
    )
}

export default page
