import { Clock } from "lucide-react"

import { LoginForm } from "@/components/login-form"

const Registro = () => {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-6 items-center justify-center rounded-md text-primary">
                        <Clock className="size-5" />
                    </div>
                    Doro
                </a>
                <LoginForm />
            </div>
        </div>
    )
}

export default Registro
