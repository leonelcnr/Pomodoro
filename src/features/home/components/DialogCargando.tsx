// import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

const DialogCargando = () => {
    return (
        <Empty className="w-full">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Spinner />
                </EmptyMedia>
                <EmptyTitle>Uniendose a la sala</EmptyTitle>
                <EmptyDescription>
                    Por favor, espera mientras te unimos a la sala. No refresques la página.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                {/* <Button variant="outline" size="sm">
                    Cancelar
                </Button> */}
            </EmptyContent>
        </Empty>
    )
}

export default DialogCargando
