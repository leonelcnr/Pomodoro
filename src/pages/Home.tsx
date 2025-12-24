import { useNavigate } from "react-router-dom"
import { UserAuth } from "../services/AuthContexto"
import Perfil from "../features/home/components/Perfil"

const Home = () => {
    const navigate = useNavigate()
    const { cerrarSesion } = UserAuth()
    const { user } = UserAuth()
    return (
        <></>
    )
}
export default Home
