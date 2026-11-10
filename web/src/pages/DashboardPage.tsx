import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNutrition, type NutritionResponse } from "../api/user";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";

export default function DashboardPage() {
    const { user } = useAuth();
    const [nutrition, setNutrition] = useState<NutritionResponse | null>(null);

    const profileComplete = Boolean(
        user && user.age && user.height && user.weight &&
        user.gender && user.activityLevel && user.goal
    );

    useEffect(() => {
        if (profileComplete) {
            getNutrition()
                .then(setNutrition)
                .catch(() => setNutrition(null));
        }
    }, [profileComplete]);

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="hero">
                    <div className="hero-overlay">
                        <h1 className="hero-title">Zdrava prehrana počinje ovdje 🥗</h1>
                        <p className="hero-sub">Dobrodošao, {user?.email}</p>
                    </div>
                </div>
                <div className="card">
                    <h1 className="card-title">Tvoj dnevni cilj</h1>

                    {!profileComplete && (
                        <div className="notice">
                            <span>Popuni profil da izračunamo tvoje dnevne kalorije i makronutrijente.</span>
                            <Link to="/profile">
                                <button className="btn">Popuni profil</button>
                            </Link>
                        </div>
                    )}

                    {profileComplete && nutrition && (
                        <>
                            <div className="stat-grid">
                                <div className="stat-card primary">
                                    <div className="stat-value">{nutrition.calories}</div>
                                    <div className="stat-label">kcal / dan</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{nutrition.protein} g</div>
                                    <div className="stat-label">Bjelančevine</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{nutrition.carbs} g</div>
                                    <div className="stat-label">Ugljikohidrati</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{nutrition.fat} g</div>
                                    <div className="stat-label">Masti</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 22 }}>
                                <Link to="/profile">
                                    <button className="btn btn-ghost">Uredi profil</button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
