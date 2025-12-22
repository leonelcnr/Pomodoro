import { useNavigate } from "react-router-dom"
import { UserAuth } from "../services/AuthContexto"
import Perfil from "../features/home/components/Perfil"

const Home = () => {
    const navigate = useNavigate()
    const { cerrarSesion } = UserAuth()
    const { user } = UserAuth()
    return (
        <div>
            <Perfil usuario={user?.name} correo={user?.email} foto={user?.picture} />
            <h1>Home</h1>
            <button onClick={() => navigate('/timer')}>Timer</button>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button onClick={cerrarSesion}>Logout</button>
        </div>
    )
}
export default Home
