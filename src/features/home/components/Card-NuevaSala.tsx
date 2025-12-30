import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CardNuevaSala = () => {
    return (
        <Card className="w-full h-[250px]">
            <CardHeader>
                <CardTitle className="">Nueva Sala</CardTitle>
                <CardDescription>
                    Crea una sala o une a una existente
                </CardDescription>
                <CardAction>
                    {/* <Button variant="link">Crear</Button>
                    <Button variant="link">Unirse</Button> */}
                </CardAction>
            </CardHeader>
            <CardContent className="h-[150px]">

            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                <Button type="submit" className="w-full">
                    Crear
                </Button>
                <Button variant="outline" className="w-full">
                    Unirse
                </Button>
            </CardFooter>
        </Card>

    )
}

export default CardNuevaSala
