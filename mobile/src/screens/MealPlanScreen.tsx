import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
    generatePlan, savePlan, getPlans, deletePlan,
    type MealPlanResponse, type MealPlanItemResponse,
} from "../api/mealPlan";
import type { MealType } from "../api/meal";
import { colors } from "../theme";

const MEAL_LABELS: Record<MealType, string> = { BREAKFAST: "Doručak", LUNCH: "Ručak", DINNER: "Večera", SNACK: "Međuobrok" };
const ORDER: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Grouped({ items }: { items: MealPlanItemResponse[] }) {
    return (
        <>
            {ORDER.map((mt) => {
                const mi = items.filter((i) => i.mealType === mt);
                if (mi.length === 0) return null;
                return (
                    <View key={mt} style={{ marginBottom: 12 }}>
                        <Text style={styles.mealHead}>{MEAL_LABELS[mt]}</Text>
                        {mi.map((it, idx) => (
                            <View key={idx} style={styles.item}>
                                <Text style={styles.itemName}>{it.foodName}</Text>
                                <Text style={styles.itemMeta}>{it.quantityGrams} g · {it.calories} kcal · B {it.protein}g U {it.carbs}g M {it.fat}g</Text>
                            </View>
                        ))}
                    </View>
                );
            })}
        </>
    );
}

export default function MealPlanScreen() {
    const [generated, setGenerated] = useState<MealPlanResponse | null>(null);
    const [plans, setPlans] = useState<MealPlanResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);

    async function loadPlans() { try { setPlans(await getPlans()); } catch { setPlans([]); } }
    useEffect(() => { loadPlans(); }, []);

    async function gen() {
        setLoading(true);
        try { setGenerated(await generatePlan(today())); }
        catch { Alert.alert("Greška", "Popuni profil i dodaj namirnice u kategorije."); setGenerated(null); }
        finally { setLoading(false); }
    }

    async function save() {
        if (!generated) return;
        try { await savePlan(generated); setGenerated(null); loadPlans(); Alert.alert("Spremljeno", "Plan je spremljen."); }
        catch { Alert.alert("Greška", "Nije spremljeno."); }
    }

    async function del(id: number) { await deletePlan(id); loadPlans(); }

    return (
        <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.card}>
                <Text style={styles.title}>Plan prehrane (danas)</Text>
                <TouchableOpacity style={styles.button} onPress={gen} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? "..." : "Generiraj plan"}</Text>
                </TouchableOpacity>
            </View>

            {generated && (
                <View style={styles.card}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <Text style={styles.title}>Predloženi plan</Text>
                        <TouchableOpacity style={styles.smallBtn} onPress={save}><Text style={styles.buttonText}>Spremi</Text></TouchableOpacity>
                    </View>
                    <Text style={styles.muted}>Cilj {generated.targetCalories} · Plan {generated.totalCalories} kcal</Text>
                    <View style={{ marginTop: 10 }}><Grouped items={generated.items} /></View>
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.title}>Spremljeni planovi</Text>
                {plans.length === 0 ? (
                    <Text style={styles.muted}>Još nema spremljenih planova.</Text>
                ) : (
                    plans.map((p) => (
                        <View key={p.id ?? p.date} style={{ marginBottom: 8 }}>
                            <TouchableOpacity style={styles.planRow} onPress={() => setExpanded(expanded === p.id ? null : p.id)}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{p.date}  {expanded === p.id ? "▲" : "▼"}</Text>
                                    <Text style={styles.itemMeta}>{p.totalCalories} kcal · {p.items.length} stavki</Text>
                                </View>
                                <TouchableOpacity onPress={() => p.id && del(p.id)}><Text style={styles.del}>×</Text></TouchableOpacity>
                            </TouchableOpacity>
                            {expanded === p.id && <View style={{ marginTop: 8, paddingLeft: 8 }}><Grouped items={p.items} /></View>}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    title: { fontSize: 18, fontWeight: "800", color: colors.text },
    muted: { color: colors.muted, fontSize: 13, marginTop: 4 },
    button: { backgroundColor: colors.olive, borderRadius: 12, padding: 13, alignItems: "center", marginTop: 12 },
    smallBtn: { backgroundColor: colors.olive, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    mealHead: { fontSize: 12, fontWeight: "800", color: colors.oliveDark, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: colors.oliveSoft },
    item: { backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 6 },
    itemName: { fontWeight: "700", color: colors.text },
    itemMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
    planRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12 },
    del: { color: colors.danger, fontSize: 24, paddingHorizontal: 8 },
});
