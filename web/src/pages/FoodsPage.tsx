import { useEffect, useState, type FormEvent } from "react";
import {
    getFoods,
    createFood,
    searchExternalFoods,
    updateFood,
    type FoodResponse,
} from "../api/food";
import Topbar from "../components/Topbar";

export default function FoodsPage() {
    const [foods, setFoods] = useState<FoodResponse[]>([]);
    const [search, setSearch] = useState("");

    // Ručno dodavanje
    const [name, setName] = useState("");
    const [category, setCategory] = useState("OTHER");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [error, setError] = useState("");

    // OpenFoodFacts pretraga
    const [extQuery, setExtQuery] = useState("");
    const [extResults, setExtResults] = useState<FoodResponse[]>([]);
    const [extLoading, setExtLoading] = useState(false);
    const [extSearched, setExtSearched] = useState(false);
    const [added, setAdded] = useState<Set<string>>(new Set());

    async function loadFoods(q: string) {
        try {
            setFoods(await getFoods(q));
        } catch {
            setFoods([]);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => loadFoods(search), 250);
        return () => clearTimeout(timer);
    }, [search]);

    async function handleAdd(e: FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await createFood({
                name,
                category,
                caloriesPer100g: Number(calories),
                proteinPer100g: Number(protein),
                carbsPer100g: Number(carbs),
                fatPer100g: Number(fat),
            });
            setName("");
            setCalories("");
            setProtein("");
            setCarbs("");
            setFat("");
            loadFoods(search);
        } catch {
            setError("Dodavanje nije uspjelo. Provjeri vrijednosti.");
        }
    }

    async function handleExternalSearch(e: FormEvent) {
        e.preventDefault();
        if (!extQuery.trim()) return;
        setExtLoading(true);
        setExtSearched(true);
        try {
            setExtResults(await searchExternalFoods(extQuery.trim()));
        } catch {
            setExtResults([]);
        } finally {
            setExtLoading(false);
        }
    }

    async function handleImport(food: FoodResponse) {
        const key = food.barcode ?? food.name;
        try {
            await createFood({
                name: food.name,
                barcode: food.barcode,
                imageUrl: food.imageUrl,
                caloriesPer100g: food.caloriesPer100g,
                proteinPer100g: food.proteinPer100g,
                carbsPer100g: food.carbsPer100g,
                fatPer100g: food.fatPer100g,
            });
            setAdded((prev) => new Set(prev).add(key));
            loadFoods(search);
        } catch {
            // ignore
        }
    }

    async function handleCategoryChange(food: FoodResponse, newCategory: string) {
        if (food.id == null) return;
        await updateFood(food.id, {
            name: food.name,
            barcode: food.barcode,
            imageUrl: food.imageUrl,
            category: newCategory,
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
        });
        loadFoods(search);
    }

    function macros(f: FoodResponse) {
        return `${f.caloriesPer100g} kcal · B ${f.proteinPer100g}g · U ${f.carbsPer100g}g · M ${f.fatPer100g}g`;
    }

    return (
        <>
            <Topbar />
            <div className="page">
                {/* Ručno dodavanje */}
                <div className="card">
                    <h1 className="card-title">Dodaj namirnicu ručno</h1>
                    <p className="card-subtitle">Nutritivne vrijednosti unosiš na 100 g.</p>

                    <form onSubmit={handleAdd}>
                        <div style={{ marginBottom: 16 }}>
                            <label className="field-label">Naziv</label>
                            <input className="field-input" value={name}
                                onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label className="field-label">Kategorija</label>
                            <select className="field-select" value={category}
                                onChange={(e) => setCategory(e.target.value)}>
                                <option value="PROTEIN">Protein (meso, riba, jaja)</option>
                                <option value="CARBS">Ugljikohidrati (riža, tjestenina, kruh)</option>
                                <option value="VEGETABLE">Povrće</option>
                                <option value="FRUIT">Voće</option>
                                <option value="DAIRY">Mliječni proizvodi</option>
                                <option value="FAT">Masti / orašasti</option>
                                <option value="OTHER">Ostalo</option>
                            </select>
                        </div>
                        <div className="form-grid">
                            <div>
                                <label className="field-label">Kalorije (kcal)</label>
                                <input className="field-input" type="number" step="0.1" min="0"
                                    value={calories} onChange={(e) => setCalories(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Bjelančevine (g)</label>
                                <input className="field-input" type="number" step="0.1" min="0"
                                    value={protein} onChange={(e) => setProtein(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Ugljikohidrati (g)</label>
                                <input className="field-input" type="number" step="0.1" min="0"
                                    value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
                            </div>
                            <div>
                                <label className="field-label">Masti (g)</label>
                                <input className="field-input" type="number" step="0.1" min="0"
                                    value={fat} onChange={(e) => setFat(e.target.value)} required />
                            </div>
                        </div>
                        {error && <p className="error-text">{error}</p>}
                        <div style={{ marginTop: 18 }}>
                            <button className="btn" type="submit">Dodaj</button>
                        </div>
                    </form>
                </div>

                {/* OpenFoodFacts pretraga */}
                <div className="card">
                    <h1 className="card-title">Pretraži javnu bazu (OpenFoodFacts) 🌍</h1>
                    <p className="card-subtitle">Nađi proizvod po nazivu i dodaj ga u svoju bazu jednim klikom.</p>

                    <form className="chat-input-row" onSubmit={handleExternalSearch}>
                        <input
                            className="field-input"
                            placeholder="npr. nutella, chobani jogurt..."
                            value={extQuery}
                            onChange={(e) => setExtQuery(e.target.value)}
                        />
                        <button className="btn" type="submit" disabled={extLoading}>
                            {extLoading ? "..." : "Traži"}
                        </button>
                    </form>

                    {extSearched && !extLoading && extResults.length === 0 && (
                        <div className="empty-state">Nema rezultata za taj pojam.</div>
                    )}

                    {extResults.length > 0 && (
                        <div className="row-gap" style={{ marginTop: 16 }}>
                            {extResults.map((f, idx) => {
                                const key = f.barcode ?? f.name;
                                const isAdded = added.has(key);
                                return (
                                    <div className="entry-item" key={f.barcode ?? idx}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            {f.imageUrl ? (
                                                <img src={f.imageUrl} className="food-thumb" alt="" />
                                            ) : (
                                                <div className="food-thumb food-thumb-empty">🍽️</div>
                                            )}
                                            <div>
                                                <div className="food-name">{f.name}</div>
                                                <div className="food-macros">
                                                    {macros(f)} <span className="muted">/ 100g</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className={isAdded ? "btn btn-ghost" : "btn"}
                                            onClick={() => handleImport(f)}
                                            disabled={isAdded}
                                        >
                                            {isAdded ? "Dodano ✓" : "Dodaj"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Lokalna lista */}
                <div className="card">
                    <h1 className="card-title">Moje namirnice</h1>
                    <input
                        className="field-input search-input"
                        placeholder="Pretraži svoje namirnice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {foods.length === 0 ? (
                        <div className="empty-state">Nema namirnica. Dodaj ručno ili iz OpenFoodFacts. 🍎</div>
                    ) : (
                        <div className="food-list">
                            {foods.map((f) => (
                                <div className="food-item" key={f.id}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {f.imageUrl ? (
                                            <img src={f.imageUrl} className="food-thumb" alt="" />
                                        ) : (
                                            <div className="food-thumb food-thumb-empty">🍽️</div>
                                        )}
                                        <div>
                                            <div className="food-name">{f.name}</div>
                                            <div className="food-macros">
                                                {macros(f)} <span className="muted">/ 100g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <select
                                        className="field-select"
                                        value={f.category ?? "OTHER"}
                                        onChange={(e) => handleCategoryChange(f, e.target.value)}
                                        style={{ width: "auto", padding: "6px 8px", fontSize: 13 }}
                                        title="Promijeni kategoriju"
                                    >
                                        <option value="PROTEIN">Protein</option>
                                        <option value="CARBS">Ugljikohidrati</option>
                                        <option value="VEGETABLE">Povrće</option>
                                        <option value="FRUIT">Voće</option>
                                        <option value="DAIRY">Mliječno</option>
                                        <option value="FAT">Masti</option>
                                        <option value="OTHER">Ostalo</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
