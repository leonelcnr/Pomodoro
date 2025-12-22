

import { UserAuth } from "../services/AuthContexto";
import {ArrowLeft} from 'lucide-react';
import { Link } from "react-router-dom";

const Login = () => {

    const { iniciarSesionConGoogle } = UserAuth();

    return (
        <div >
            <nav className="p-4 sticky top-0 z-10 bg">
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition">
                <ArrowLeft />
              </Link>
            </nav>
        <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-2xl shadow-xl text-white">
            <h1 className="text-4xl font-bold mb-6">Login</h1>  
            <button className="px-8 py-3 rounded-full font-bold text-xl bg-blue-500 hover:bg-blue-600 transition-all" onClick={()=> iniciarSesionConGoogle()}>iniciar sesion con google</button>
        </div>
        </div>
    );
}

export default Login;