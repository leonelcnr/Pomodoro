import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

const HomeLayout = () => {
    return (
        <div className="">
            <Outlet />
            <Toaster
                position="bottom-right"
                richColors
                closeButton
                duration={4000}
            />
        </div>
    );
}

export default HomeLayout
