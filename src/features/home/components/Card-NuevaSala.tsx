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
import DialogUnirse from "./DialogUnirse"

const CardNuevaSala = () => {
    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle className="text-lg">Nueva Sala</CardTitle>
                <CardDescription>
                    Crea una sala o une a una existente
                </CardDescription>
                <CardAction>
                    {/* <Button variant="link">Crear</Button>
                    <Button variant="link">Unirse</Button> */}
                </CardAction>
            </CardHeader>
            <CardContent className="h-3/4">
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolorem, unde eligendi tempora autem, molestiae magnam obcaecati exercitationem libero in eum expedita. Quae neque amet, beatae possimus blanditiis facilis dolore officiis?</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure ipsum nostrum dolor architecto enim. Voluptates fugiat odit laboriosam neque provident, minus sed corrupti, nam id temporibus accusantium, distinctio eligendi. Ad.</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
                <Button type="submit" className="w-full h-10">
                    Crear
                </Button>
                <DialogUnirse />
            </CardFooter>
        </Card>

    )
}

export default CardNuevaSala
