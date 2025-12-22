import { Link } from "react-router-dom"
import {ArrowLeft} from 'lucide-react';
const Dashboard = () => {
    return (
        <div>
            <nav className="p-4 sticky top-0 z-10 bg">
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition">
                <ArrowLeft />
              </Link>
            </nav>
            <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        </div>
    )
}
export default Dashboard