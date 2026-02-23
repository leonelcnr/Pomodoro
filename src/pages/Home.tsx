import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"
import { Separator } from "@/components/ui/separator"
import SalaNueva from "../features/home/components/SalaNueva"


const Home = () => {
    return (
        <>
            <SidebarProvider defaultOpen={false}
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-0 ">
                            <div className="max-w-full h-full flex justify-center flex-col gap-4 py-4 md:gap-6 md:py-6 ">
                                <div className="w-full">
                                    <SalaNueva />
                                </div>

                                <Separator
                                    orientation="horizontal"
                                    className="mx-2 data-[orientation=horizontal]:w-full"
                                />
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-2xl font-bold px-7">Tareas</h1>
                                    <DataTable data={data} />
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

export default Home
