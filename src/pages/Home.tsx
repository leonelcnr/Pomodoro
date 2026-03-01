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
                            <div className="max-w-full h-full flex flex-col gap-4 px-4 py-4 md:px-6 md:py-6 lg:px-8">
                                <div className="w-full">
                                    <SalaNueva />
                                </div>

                                <Separator
                                    orientation="horizontal"
                                    className="my-4 data-[orientation=horizontal]:w-full"
                                />

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1 mb-2">
                                        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
                                        <p className="text-muted-foreground text-sm">
                                            Aquí tienes una lista de tus tareas.
                                        </p>
                                    </div>
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
