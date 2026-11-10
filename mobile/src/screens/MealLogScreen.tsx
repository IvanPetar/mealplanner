import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { getFoods, type FoodResponse } from "../api/food";
import {
    logMeal, getDailyLog, deleteMealEntry, getDailyProgress,
    type DailyLogResponse, type DailyProgressResponse, type MealType,
} from "../api/meal";
import { colors } from "../theme";

const MEAL_LABELS: Record<MealType, string> = { BREAKFAST: "Doručak", LUNCH: "Ručak", DINNER: "Večera", SNACK: "Međuobrok" };
const MEALS: { v: MealType; l: string }[] = [
    { v: "BREAKFAST", l: "Doručak" }, { v: "LUNCH", l: "Ručak" }, { v: "DINNER", l: "Večera" }, { v: "SNACK", l: "Međuobrok" },
];

interface BasketItem { food: FoodResponse; grams: string; }

function toIso(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function today() { return toIso(new Date()); }
function addDays(iso: string, delta: number) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    return toIso(dt);
}

export default function MealLogScreen() {
    const [date, setDate] = useState(today());
    const [log, setLog] = useState<DailyLogResponse | null>(null);
    const [progress, setProgress] = useState<DailyProgressResponse | null>(null);

    const [search, setSearch] = useState("");
    const [results, setResults] = useState<FoodResponse[]>([]);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [mealType, setMealType] = useState<MealType>("BREAKFAST");

    async function reload() {
        try { setLog(await getDailyLog(date)); } catch { setLog(null); }
        try { setProgress(await getDailyProgress(date)); } catch { setProgress(null); }
    }
    useEffect(() => { reload(); }, [date]);

    useEffect(() => {
        if (!search.trim()) { setResults([]); return; }
        const t = setTimeout(async () => {
            try { setResults(await getFoods(search)); } catch { setResults([]); }
        }, 250);
        return () => clearTimeout(t);
    }, [search]);

    function addToBasket(food: FoodResponse) {
        if (basket.some((b) => b.food.id === food.id)) return;
        setBasket((p) => [...p, { food, grams: "100" }]);
        setSearch("");
        setResults([]);
    }
    function updateGrams(i: number, v: string) {
        setBasket((p) => p.map((b, idx) => (idx === i ? { ...b, grams: v } : b)));
    }
    function removeFromBasket(i: number) {
        setBasket((p) => p.filter((_, idx) => idx !== i));
    }

    async function logMealBasket() {
        for (const item of basket) {
            if (item.food.id == null) continue;
            await logMeal({ foodId: item.food.id, quantityGrams: Number(item.grams), mealType, date });
        }
        setBasket([]);
        reload();
    }

    async function del(id: number) { await deleteMealEntry(id); reload(); }

    const pct = progress ? Math.min(progress.caloriePercentage, 100) : 0;

    return (
        <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.card}>
                <View style={styles.dateNav}>
                    <TouchableOpacity onPress={() => setDate(addDays(date, -1))}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
                    <Text style={styles.dateText}>{date === today() ? "Danas" : date}</Text>
                    <TouchableOpacity onPress={() => setDate(addDays(date, 1))}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
                </View>

                {progress ? (
                    <>
                        <View style={styles.progHead}>
                            <Text style={styles.progBig}>{progress.consumedCalories} / {progress.targetCalories} kcal</Text>
                            <Text style={styles.muted}>{progress.caloriePercentage}%</Text>
                        </View>
                        <View style={styles.progBar}><View style={[styles.progFill, { width: `${pct}%` }]} /></View>
                        <Text style={[styles.muted, { marginTop: 8 }]}>
                            B {progress.consumedProtein}/{progress.targetProtein}g · U {progress.consumedCarbs}/{progress.targetCarbs}g · M {progress.consumedFat}/{progress.targetFat}g
                        </Text>
                    </>
                ) : (
                    <Text style={styles.muted}>Popuni profil za prikaz napretka. Pojedeno: {log?.totalCalories ?? 0} kcal.</Text>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Dodaj obrok</Text>

                <View style={styles.chipRow}>
                    {MEALS.map((m) => (
                        <TouchableOpacity key={m.v} style={[styles.chip, mealType === m.v && styles.chipActive]} onPress={() => setMealType(m.v)}>
                            <Text style={[styles.chipText, mealType === m.v && styles.chipTextActive]}>{m.l}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput style={styles.input} placeholder="Traži namirnicu..." value={search} onChangeText={setSearch} />
                {results.map((f) => (
                    <TouchableOpacity key={f.id} style={styles.resultRow} onPress={() => addToBasket(f)}>
                        <Text style={styles.itemName}>{f.name}</Text>
                        <Text style={styles.itemMeta}>{f.caloriesPer100g} kcal / 100g · dodaj +</Text>
                    </TouchableOpacity>
                ))}

                {basket.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                        {basket.map((item, i) => (
                            <View key={item.food.id} style={styles.selectedRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.food.name}</Text>
                                    <Text style={styles.itemMeta}>{item.food.caloriesPer100g} kcal / 100g</Text>
                                </View>
                                <TextInput style={styles.gramsInput} keyboardType="numeric" value={item.grams} onChangeText={(v) => updateGrams(i, v)} />
                                <Text style={styles.muted}>g</Text>
                                <TouchableOpacity onPress={() => removeFromBasket(i)}><Text style={styles.del}>×</Text></TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.button} onPress={logMealBasket}>
                            <Text style={styles.buttonText}>Zabilježi obrok ({MEAL_LABELS[mealType]})</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Uneseni obroci</Text>
                {!log || log.entries.length === 0 ? (
                    <Text style={styles.muted}>Nema unosa za ovaj dan.</Text>
                ) : (
                    log.entries.map((en) => (
                        <View key={en.id} style={styles.entryRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}><Text style={styles.tag}>{MEAL_LABELS[en.mealType]} </Text>{en.foodName}</Text>
                                <Text style={styles.itemMeta}>{en.quantityGrams} g · {en.calories} kcal · B {en.protein}g U {en.carbs}g M {en.fat}g</Text>
                            </View>
                            <TouchableOpacity onPress={() => del(en.id)}><Text style={styles.del}>×</Text></TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    title: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 12 },
    muted: { color: colors.muted, fontSize: 13 },
    dateNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    arrow: { fontSize: 20, color: colors.oliveDark, paddingHorizontal: 12 },
    dateText: { fontSize: 17, fontWeight: "800", color: colors.text },
    progHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
    progBig: { fontSize: 18, fontWeight: "800", color: colors.text },
    progBar: { height: 12, backgroundColor: colors.oliveSoft, borderRadius: 999, overflow: "hidden" },
    progFill: { height: "100%", backgroundColor: colors.olive, borderRadius: 999 },
    input: { backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fcfdfa" },
    chipActive: { backgroundColor: colors.oliveSoft, borderColor: colors.olive },
    chipText: { color: colors.text, fontSize: 13 },
    chipTextActive: { color: colors.oliveDark, fontWeight: "700" },
    resultRow: { padding: 11, borderBottomWidth: 1, borderBottomColor: colors.border },
    selectedRow: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 6 },
    gramsInput: { width: 70, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, textAlign: "center" },
    entryRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginBottom: 6 },
    itemName: { fontWeight: "700", color: colors.text },
    itemMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
    tag: { color: colors.oliveDark, fontSize: 12, fontWeight: "800" },
    del: { color: colors.danger, fontSize: 22, paddingHorizontal: 8 },
    button: { backgroundColor: colors.olive, borderRadius: 12, padding: 13, alignItems: "center", marginTop: 14 },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
