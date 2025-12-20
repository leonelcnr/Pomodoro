import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Registro from './pages/Registro'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import { AuthContextProvider } from './services/AuthContexto'
import Login from './pages/Login'
function App() {

  return (
    <AuthContextProvider> {/* meneja que el usuario este logueado */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
