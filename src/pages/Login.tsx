

import { UserAuth } from "../services/AuthContexto";

const Login = () => {

    const { iniciarSesionConGoogle } = UserAuth();

    return (
        <div>
            <h1>Login</h1>  
            <button onClick={()=> iniciarSesionConGoogle()}>iniciar sesion con google</button>
        </div>
    );
}

export default Login;