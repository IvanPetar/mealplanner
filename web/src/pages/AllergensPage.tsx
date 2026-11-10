import { useEffect, useState, type FormEvent } from "react";
import {
    getAllergens,
    createAllergen,
    getUserAllergens,
    updateUserAllergens,
    type AllergenResponse,
} from "../api/allergen";
import Topbar from "../components/Topbar";

export default function AllergensPage() {
    const [allergens, setAllergens] = useState<AllergenResponse[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [newName, setNewName] = useState("");
    const [saved, setSaved] = useState(false);

    async function loadAll() {
        try {
            setAllergens(await getAllergens());
        } catch {
            setAllergens([]);
        }
        try {
            const mine = await getUserAllergens();
            setSelected(new Set(mine.map((a) => a.id)));
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    function toggle(id: number) {
        setSaved(false);
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    async function handleSave() {
        await updateUserAllergens([...selected]);
        setSaved(true);
    }

    async function handleAdd(e: FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        await createAllergen(newName.trim());
        setNewName("");
        loadAll();
    }

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="card">
                    <h1 className="card-title">Moji alergeni</h1>
                    <p className="card-subtitle">
                        Označi alergene koje imaš — aplikacija te može upozoriti kod skeniranja proizvoda.
                    </p>

                    {allergens.length === 0 ? (
                        <div className="empty-state">Katalog alergena je prazan. Dodaj ih ispod. ⬇️</div>
                    ) : (
                        <div className="allergen-grid">
                            {allergens.map((a) => (
                                <label key={a.id} className={selected.has(a.id) ? "allergen-chip selected" : "allergen-chip"}>
                                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                                    {a.name}
                                </label>
                            ))}
                        </div>
                    )}

                    {allergens.length > 0 && (
                        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
                            <button className="btn" onClick={handleSave}>Spremi</button>
                            {saved && <span className="muted">Spremljeno ✓</span>}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h1 className="card-title">Dodaj alergen u katalog</h1>
                    <p className="card-subtitle">Ako alergen ne postoji na popisu, dodaj ga ovdje.</p>
                    <form className="chat-input-row" onSubmit={handleAdd}>
                        <input
                            className="field-input"
                            placeholder="npr. Gluten, Mlijeko, Orašasti plodovi..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button className="btn" type="submit">Dodaj</button>
                    </form>
                </div>
            </div>
        </>
    );
}
