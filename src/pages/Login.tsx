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
import { UserAuth } from "../services/AuthContexto"


const Login = () => {
	const { iniciarSesionConGoogle } = UserAuth()


	return (
		<Card className="w-full max-w-md h-auto min-h-1/2">
			<CardHeader>
				<CardTitle>Login to your account</CardTitle>
				<CardDescription>
					Enter your email below to login to your account
				</CardDescription>
				<CardAction>
					<Button variant="link">Sign Up</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<form>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Contraseña</Label>
								<a
									href="#"
									className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
								>
									Olvidaste tu contraseña?
								</a>
							</div>
							<Input id="password" type="password" required />
						</div>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-2">
				<Button type="submit" className="w-full">
					Iniciar Sesión
				</Button>
				<Button variant="outline" className="w-full" onClick={iniciarSesionConGoogle}>
					Iniciar con Google
				</Button>
			</CardFooter>
		</Card>
	)
}
export default Login