import { Outlet } from "react-router-dom";
import { ThemeTogglerButton } from "@/components/ui/theme-toggler";
import { div } from "framer-motion/client";
const HomeLayout = () => {
    return (
        <div className="">
            <Outlet />
        </div>
    );
}

export default HomeLayout

