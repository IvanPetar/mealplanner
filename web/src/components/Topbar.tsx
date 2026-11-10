import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/login");
    }

    const navClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? "nav-link active" : "nav-link";

    return (
        <div className="topbar">
            <div className="topbar-left">
                <Link
                    to="/dashboard"
                    className="topbar-brand"
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <span className="topbar-mark">🥗</span> Meal Planner
                </Link>
                <nav className="topbar-nav">
                    <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
                    <NavLink to="/foods" className={navClass}>Namirnice</NavLink>
                    <NavLink to="/log" className={navClass}>Dnevnik</NavLink>
                    <NavLink to="/plan" className={navClass}>Plan</NavLink>
                    <NavLink to="/chat" className={navClass}>AI asistent</NavLink>
                    <NavLink to="/allergens" className={navClass}>Alergeni</NavLink>
                </nav>
            </div>
            <div className="topbar-right">
                <span className="topbar-user">{user?.email}</span>
                <button className="btn btn-ghost" onClick={handleLogout}>Odjava</button>
            </div>
        </div>
    );
}
