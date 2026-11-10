import { useEffect, useState } from "react";
import {
    generatePlan,
    savePlan,
    getPlans,
    deletePlan,
    type MealPlanResponse,
    type MealPlanItemResponse,
} from "../api/mealPlan";
import type { MealType } from "../api/meal";
import Topbar from "../components/Topbar";

const MEAL_LABELS: Record<MealType, string> = {
    BREAKFAST: "Doručak",
    LUNCH: "Ručak",
    DINNER: "Večera",
    SNACK: "Međuobrok",
};

const MEAL_ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

function todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function PlanItemsGrouped({ items }: { items: MealPlanItemResponse[] }) {
    return (
        <>
            {MEAL_ORDER.map((mt) => {
                const mealItems = items.filter((it) => it.mealType === mt);
                if (mealItems.length === 0) return null;
                return (
                    <div key={mt} style={{ marginBottom: 16 }}>
                        <div className="meal-heading">{MEAL_LABELS[mt]}</div>
                        <div className="row-gap">
                            {mealItems.map((it, idx) => (
                                <div className="entry-item" key={idx}>
                                    <div>
                                        <b>{it.foodName}</b>
                                        <div className="entry-meta">
                                            {it.quantityGrams} g · {it.calories} kcal · B {it.protein}g · U {it.carbs}g · M {it.fat}g
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default function MealPlanPage() {
    const [date, setDate] = useState(todayIso());
    const [generated, setGenerated] = useState<MealPlanResponse | null>(null);
    const [plans, setPlans] = useState<MealPlanResponse[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    async function loadPlans() {
        try {
            setPlans(await getPlans());
        } catch {
            setPlans([]);
        }
    }

    useEffect(() => {
        loadPlans();
    }, []);

    async function handleGenerate() {
        setError("");
        setLoading(true);
        try {
            setGenerated(await generatePlan(date));
        } catch {
            setError("Generiranje nije uspjelo. Popuni profil i dodaj barem jednu namirnicu.");
            setGenerated(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!generated) return;
        try {
            await savePlan({
                date: generated.date,
                targetCalories: generated.targetCalories,
                items: generated.items.map((i) => ({
                    foodId: i.foodId,
                    mealType: i.mealType,
                    quantityGrams: i.quantityGrams,
                })),
            });
            setGenerated(null);
            loadPlans();
        } catch {
            setError("Spremanje nije uspjelo.");
        }
    }

    async function handleDelete(id: number) {
        await deletePlan(id);
        loadPlans();
    }

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <h1 className="card-title" style={{ marginBottom: 0 }}>Generiraj plan prehrane</h1>
                        <div style={{ display: "flex", gap: 10 }}>
                            <input className="field-input" type="date" style={{ width: "auto" }}
                                value={date} onChange={(e) => setDate(e.target.value)} />
                            <button className="btn" onClick={handleGenerate} disabled={loading}>
                                {loading ? "..." : "Generiraj"}
                            </button>
                        </div>
                    </div>
                    <p className="card-subtitle" style={{ marginTop: 12, marginBottom: 0 }}>
                        Sustav rasporedi ciljne kalorije na obroke (25/35/30/10%) i predloži namirnice po kategorijama.
                    </p>
                    {error && <p className="error-text">{error}</p>}
                </div>

                {generated && (
                    <div className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <h1 className="card-title" style={{ marginBottom: 0 }}>Predloženi plan</h1>
                            <button className="btn" onClick={handleSave}>Spremi plan</button>
                        </div>
                        <p className="card-subtitle" style={{ marginTop: 8, marginBottom: 18 }}>
                            Cilj {generated.targetCalories} kcal · Plan {generated.totalCalories} kcal ·
                            B {generated.totalProtein}g · U {generated.totalCarbs}g · M {generated.totalFat}g
                        </p>
                        <PlanItemsGrouped items={generated.items} />
                    </div>
                )}

                <div className="card">
                    <h1 className="card-title">Spremljeni planovi</h1>
                    {plans.length === 0 ? (
                        <div className="empty-state">Još nema spremljenih planova.</div>
                    ) : (
                        <div className="row-gap">
                            {plans.map((p) => (
                                <div key={p.id ?? p.date}>
                                    <div className="entry-item" style={{ cursor: "pointer" }}
                                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                                        <div>
                                            <div>
                                                <b>{p.date}</b>{" "}
                                                <span className="muted">{expandedId === p.id ? "▲" : "▼"}</span>
                                            </div>
                                            <div className="entry-meta">
                                                {p.totalCalories} kcal · B {p.totalProtein}g · U {p.totalCarbs}g · M {p.totalFat}g · {p.items.length} stavki
                                            </div>
                                        </div>
                                        <button className="entry-del"
                                            onClick={(e) => { e.stopPropagation(); if (p.id) handleDelete(p.id); }}
                                            title="Obriši">×</button>
                                    </div>

                                    {expandedId === p.id && (
                                        <div style={{ marginTop: 12, marginBottom: 8, paddingLeft: 12 }}>
                                            <PlanItemsGrouped items={p.items} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
