import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFoods, type FoodResponse } from "../api/food";
import {
    logMeal,
    getDailyLog,
    deleteMealEntry,
    getDailyProgress,
    type DailyLogResponse,
    type DailyProgressResponse,
    type MealType,
} from "../api/meal";
import Topbar from "../components/Topbar";

const MEAL_LABELS: Record<MealType, string> = {
    BREAKFAST: "Doručak",
    LUNCH: "Ručak",
    DINNER: "Večera",
    SNACK: "Međuobrok",
};

interface BasketItem {
    food: FoodResponse;
    grams: string;
}

function todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MealLogPage() {
    const [date, setDate] = useState(todayIso());
    const [log, setLog] = useState<DailyLogResponse | null>(null);
    const [progress, setProgress] = useState<DailyProgressResponse | null>(null);

    const [mealType, setMealType] = useState<MealType>("BREAKFAST");
    const [foodSearch, setFoodSearch] = useState("");
    const [searchResults, setSearchResults] = useState<FoodResponse[]>([]);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [error, setError] = useState("");

    async function reload() {
        try {
            setLog(await getDailyLog(date));
        } catch {
            setLog(null);
        }
        try {
            setProgress(await getDailyProgress(date));
        } catch {
            setProgress(null);
        }
    }

    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    useEffect(() => {
        if (!foodSearch.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            getFoods(foodSearch).then(setSearchResults).catch(() => setSearchResults([]));
        }, 200);
        return () => clearTimeout(timer);
    }, [foodSearch]);

    function addToBasket(food: FoodResponse) {
        if (basket.some((b) => b.food.id === food.id)) return;
        setBasket((prev) => [...prev, { food, grams: "100" }]);
        setFoodSearch("");
        setSearchResults([]);
    }

    function updateGrams(index: number, value: string) {
        setBasket((prev) => prev.map((b, i) => (i === index ? { ...b, grams: value } : b)));
    }

    function removeFromBasket(index: number) {
        setBasket((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleLogMeal() {
        setError("");
        if (basket.length === 0) return;
        try {
            for (const item of basket) {
                if (item.food.id == null) continue;
                await logMeal({
                    foodId: item.food.id,
                    quantityGrams: Number(item.grams),
                    mealType,
                    date,
                });
            }
            setBasket([]);
            reload();
        } catch {
            setError("Bilježenje nije uspjelo.");
        }
    }

    async function handleDelete(id: number) {
        await deleteMealEntry(id);
        reload();
    }

    const pct = progress ? Math.min(progress.caloriePercentage, 100) : 0;

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <h1 className="card-title" style={{ marginBottom: 0 }}>Dnevnik prehrane</h1>
                        <input className="field-input" type="date" style={{ width: "auto" }}
                            value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    {progress ? (
                        <div className="progress-block">
                            <div className="progress-head">
                                <span><span className="big">{progress.consumedCalories}</span> / {progress.targetCalories} kcal</span>
                                <span className="muted">{progress.caloriePercentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="macro-row">
                                <div className="macro-mini"><b>{progress.consumedProtein} / {progress.targetProtein} g</b>Bjelančevine</div>
                                <div className="macro-mini"><b>{progress.consumedCarbs} / {progress.targetCarbs} g</b>Ugljikohidrati</div>
                                <div className="macro-mini"><b>{progress.consumedFat} / {progress.targetFat} g</b>Masti</div>
                            </div>
                        </div>
                    ) : (
                        <p className="muted" style={{ marginTop: 12 }}>
                            Za prikaz napretka <Link to="/profile" className="auth-link">popuni profil</Link>.
                            {" "}Zbrojeno danas: {log?.totalCalories ?? 0} kcal.
                        </p>
                    )}
                </div>

                <div className="card">
                    <h1 className="card-title">Dodaj obrok</h1>

                    <div style={{ marginBottom: 14 }}>
                        <label className="field-label">Obrok</label>
                        <select className="field-select" value={mealType}
                            onChange={(e) => setMealType(e.target.value as MealType)}>
                            <option value="BREAKFAST">Doručak</option>
                            <option value="LUNCH">Ručak</option>
                            <option value="DINNER">Večera</option>
                            <option value="SNACK">Međuobrok</option>
                        </select>
                    </div>

                    <label className="field-label">Traži namirnicu</label>
                    <input className="field-input" placeholder="npr. jogurt, riža, banana..."
                        value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} />

                    {foodSearch.trim() && (
                        searchResults.length > 0 ? (
                            <div className="search-results">
                                {searchResults.map((f) => (
                                    <div className="search-result" key={f.id} onClick={() => addToBasket(f)}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            {f.imageUrl ? (
                                                <img src={f.imageUrl} className="food-thumb" alt="" />
                                            ) : (
                                                <div className="food-thumb food-thumb-empty">🍽️</div>
                                            )}
                                            <div>
                                                <div className="food-name">{f.name}</div>
                                                <div className="food-macros">{f.caloriesPer100g} kcal / 100g</div>
                                            </div>
                                        </div>
                                        <span className="btn btn-ghost" style={{ padding: "4px 12px" }}>Dodaj</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="muted" style={{ marginTop: 8 }}>
                                Nema rezultata. Dodaj namirnice na <Link to="/foods" className="auth-link">stranici Namirnice</Link>.
                            </p>
                        )
                    )}

                    {basket.length > 0 && (
                        <div className="row-gap" style={{ marginTop: 16 }}>
                            {basket.map((item, i) => (
                                <div className="basket-item" key={item.food.id}>
                                    <div className="basket-grow">
                                        <div className="food-name">{item.food.name}</div>
                                        <div className="food-macros">{item.food.caloriesPer100g} kcal / 100g</div>
                                    </div>
                                    <input className="field-input grams-input" type="number" min="1"
                                        value={item.grams} onChange={(e) => updateGrams(i, e.target.value)} />
                                    <span className="muted">g</span>
                                    <button className="entry-del" onClick={() => removeFromBasket(i)} title="Ukloni">×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <p className="error-text">{error}</p>}

                    <div style={{ marginTop: 16 }}>
                        <button className="btn" onClick={handleLogMeal} disabled={basket.length === 0}>
                            Zabilježi obrok ({MEAL_LABELS[mealType]})
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h1 className="card-title">Uneseni obroci</h1>
                    {!log || log.entries.length === 0 ? (
                        <div className="empty-state">Nema unosa za ovaj dan.</div>
                    ) : (
                        <div className="row-gap">
                            {log.entries.map((en) => (
                                <div className="entry-item" key={en.id}>
                                    <div>
                                        <div>
                                            <span className="meal-tag">{MEAL_LABELS[en.mealType]}</span>
                                            <b>{en.foodName}</b>
                                        </div>
                                        <div className="entry-meta">
                                            {en.quantityGrams} g · {en.calories} kcal · B {en.protein}g · U {en.carbs}g · M {en.fat}g
                                        </div>
                                    </div>
                                    <button className="entry-del" onClick={() => handleDelete(en.id)} title="Obriši">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
