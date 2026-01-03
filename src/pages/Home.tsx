import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"
import CardNuevaSala from "../features/home/components/Card-NuevaSala"
import { Separator } from "@/components/ui/separator"
import ChartRadialShape from "../features/home/components/Chart-Radial"


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
                            <div className="max-w-full h-full flex flex-col gap-4 py-4 md:gap-6 md:py-6 ">
                                <div className="grid grid-cols-2 gap-4 p-4 pt-0">
                                    <CardNuevaSala />
                                    <ChartRadialShape />
                                </div>

                                <Separator
                                    orientation="horizontal"
                                    className="mx-2 data-[orientation=horizontal]:w-full"
                                />
                                <div className="w-full h-full flex flex-col gap-4 p-4 pt-0">
                                    <h1 className="text-2xl font-bold">Estadisticas</h1>
                                    <SectionCards />
                                </div>
                                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                                    {/* <ChartAreaInteractive /> */}
                                </div>
                                <DataTable data={data} />
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

export default Home
