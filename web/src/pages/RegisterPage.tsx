import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await register({ email, password });
            navigate("/login");
        } catch {
            setError("Registracija nije uspjela. Provjeri podatke (lozinka min 8 znakova).");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-mark">🥗</div>
                    <span className="auth-brand-name">Meal Planner</span>
                </div>

                <h1 className="auth-title">Napravi račun</h1>
                <p className="auth-subtitle">Započni s pametnim planiranjem prehrane</p>

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
                            autoComplete="new-password"
                            placeholder="Min 8 znakova"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button className="auth-button" type="submit">
                        Registriraj se
                    </button>
                </form>

                <p className="auth-footer">
                    Već imaš račun? <Link className="auth-link" to="/login">Prijavi se</Link>
                </p>
            </div>
        </div>
    );
}
