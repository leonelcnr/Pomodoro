import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
const HomeLayout = () => {
    return (
        <div className="">
            <Outlet />
            <Toaster theme="dark" position="top-right" richColors />
        </div>
    );
}

export default HomeLayout

