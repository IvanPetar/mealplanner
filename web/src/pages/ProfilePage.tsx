import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, changeEmail, changePassword } from "../api/user";
import { useAuth } from "../context/AuthContext";
import Topbar from "../components/Topbar";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [age, setAge] = useState(user?.age?.toString() ?? "");
    const [height, setHeight] = useState(user?.height?.toString() ?? "");
    const [weight, setWeight] = useState(user?.weight?.toString() ?? "");
    const [gender, setGender] = useState(user?.gender ?? "");
    const [activityLevel, setActivityLevel] = useState(user?.activityLevel ?? "");
    const [goal, setGoal] = useState(user?.goal ?? "");
    const [error, setError] = useState("");

    const [newEmail, setNewEmail] = useState(user?.email ?? "");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailMsg, setEmailMsg] = useState("");

    const [curPassword, setCurPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passMsg, setPassMsg] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await updateProfile({
                age: Number(age), height: Number(height), weight: Number(weight),
                gender, activityLevel, goal,
            });
            await refreshUser();
            navigate("/dashboard");
        } catch {
            setError("Spremanje nije uspjelo. Provjeri unesene vrijednosti.");
        }
    }

    async function handleChangeEmail(e: FormEvent) {
        e.preventDefault();
        setEmailMsg("");
        try {
            await changeEmail(newEmail, emailPassword);
            await refreshUser();
            setEmailPassword("");
            setEmailMsg("Email je promijenjen ✓");
        } catch {
            setEmailMsg("Greška — provjeri email i lozinku (možda je email zauzet).");
        }
    }

    async function handleChangePassword(e: FormEvent) {
        e.preventDefault();
        setPassMsg("");
        try {
            await changePassword(curPassword, newPassword);
            setCurPassword("");
            setNewPassword("");
            setPassMsg("Lozinka je promijenjena ✓");
        } catch {
            setPassMsg("Greška — provjeri trenutnu lozinku (nova min 8 znakova).");
        }
    }

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="card">
                    <h1 className="card-title">Tvoj profil</h1>
                    <p className="card-subtitle">
                        Ovi podaci služe za izračun dnevnih kalorija i makronutrijenata (Mifflin-St Jeor).
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div>
                                <label className="field-label">Dob</label>
                                <input className="field-input" type="number" min="1" max="120"
                                    value={age} onChange={(e) => setAge(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Spol</label>
                                <select className="field-select" value={gender}
                                    onChange={(e) => setGender(e.target.value)} required>
                                    <option value="" disabled>Odaberi...</option>
                                    <option value="MALE">Muško</option>
                                    <option value="FEMALE">Žensko</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Visina (cm)</label>
                                <input className="field-input" type="number" min="50" max="300"
                                    value={height} onChange={(e) => setHeight(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Težina (kg)</label>
                                <input className="field-input" type="number" step="0.1" min="20" max="500"
                                    value={weight} onChange={(e) => setWeight(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Razina aktivnosti</label>
                                <select className="field-select" value={activityLevel}
                                    onChange={(e) => setActivityLevel(e.target.value)} required>
                                    <option value="" disabled>Odaberi...</option>
                                    <option value="SEDENTARY">Sjedilački</option>
                                    <option value="LIGHT">Lagana aktivnost</option>
                                    <option value="MODERATE">Umjerena aktivnost</option>
                                    <option value="ACTIVE">Aktivan</option>
                                    <option value="VERY_ACTIVE">Vrlo aktivan</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Cilj</label>
                                <select className="field-select" value={goal}
                                    onChange={(e) => setGoal(e.target.value)} required>
                                    <option value="" disabled>Odaberi...</option>
                                    <option value="LOSE_WEIGHT">Mršavljenje</option>
                                    <option value="MAINTAIN_WEIGHT">Održavanje</option>
                                    <option value="GAIN_WEIGHT">Debljanje</option>
                                </select>
                            </div>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <div style={{ marginTop: 22 }}>
                            <button className="btn" type="submit">Spremi profil</button>
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h1 className="card-title">Račun</h1>
                    <p className="card-subtitle">Promijeni svoj email ili lozinku.</p>

                    <form onSubmit={handleChangeEmail} style={{ marginBottom: 28 }}>
                        <div className="form-grid">
                            <div>
                                <label className="field-label">Novi email</label>
                                <input className="field-input" type="email" value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Lozinka (potvrda)</label>
                                <input className="field-input" type="password" value={emailPassword}
                                    onChange={(e) => setEmailPassword(e.target.value)} required />
                            </div>
                        </div>
                        {emailMsg && <p className="muted" style={{ marginTop: 8 }}>{emailMsg}</p>}
                        <div style={{ marginTop: 14 }}>
                            <button className="btn" type="submit">Promijeni email</button>
                        </div>
                    </form>

                    <form onSubmit={handleChangePassword}>
                        <div className="form-grid">
                            <div>
                                <label className="field-label">Trenutna lozinka</label>
                                <input className="field-input" type="password" value={curPassword}
                                    onChange={(e) => setCurPassword(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Nova lozinka (min 8)</label>
                                <input className="field-input" type="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                        </div>
                        {passMsg && <p className="muted" style={{ marginTop: 8 }}>{passMsg}</p>}
                        <div style={{ marginTop: 14 }}>
                            <button className="btn" type="submit">Promijeni lozinku</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
