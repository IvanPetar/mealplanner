import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await login({ email, password });
            navigate("/dashboard");
        } catch {
            setError("Neispravan email ili lozinka.");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-mark">🥗</div>
                    <span className="auth-brand-name">Meal Planner</span>
                </div>

                <h1 className="auth-title">Dobrodošao natrag</h1>
                <p className="auth-subtitle">Prijavi se u svoj račun</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div>
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            autoComplete="username"
                            placeholder="ime@primjer.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="auth-label">Lozinka</label>
                        <input
                            className="auth-input"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            placeholder="Tvoja lozinka"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button className="auth-button" type="submit">
                        Prijavi se
                    </button>
                </form>

                <p className="auth-footer">
                    Nemaš račun? <Link className="auth-link" to="/register">Registriraj se</Link>
                </p>
            </div>
        </div>
    );
}
