import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import {
    getFoods, createFood, searchExternalFoods, updateFood, type FoodResponse,
} from "../api/food";
import { colors } from "../theme";

const CATEGORIES = [
    { v: "PROTEIN", l: "Protein" }, { v: "CARBS", l: "Ugljikohidrati" }, { v: "VEGETABLE", l: "Povrće" },
    { v: "FRUIT", l: "Voće" }, { v: "DAIRY", l: "Mliječno" }, { v: "FAT", l: "Masti" }, { v: "OTHER", l: "Ostalo" },
];
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.v, c.l]));

export default function FoodsScreen() {
    const [foods, setFoods] = useState<FoodResponse[]>([]);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("OTHER");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");

    const [extQuery, setExtQuery] = useState("");
    const [extResults, setExtResults] = useState<FoodResponse[]>([]);
    const [extLoading, setExtLoading] = useState(false);
    const [added, setAdded] = useState<Set<string>>(new Set());

    async function loadFoods(q: string) {
        try { setFoods(await getFoods(q)); } catch { setFoods([]); }
    }
    useEffect(() => {
        const t = setTimeout(() => loadFoods(search), 250);
        return () => clearTimeout(t);
    }, [search]);

    async function addManual() {
        if (!name.trim()) { Alert.alert("Greška", "Naziv je obavezan."); return; }
        try {
            await createFood({
                name, category,
                caloriesPer100g: Number(calories), proteinPer100g: Number(protein),
                carbsPer100g: Number(carbs), fatPer100g: Number(fat),
            });
            setName(""); setCalories(""); setProtein(""); setCarbs(""); setFat(""); setCategory("OTHER");
            loadFoods(search);
        } catch { Alert.alert("Greška", "Provjeri vrijednosti."); }
    }

    async function extSearch() {
        if (!extQuery.trim()) return;
        setExtLoading(true);
        try { setExtResults(await searchExternalFoods(extQuery.trim())); }
        catch { setExtResults([]); }
        finally { setExtLoading(false); }
    }

    async function importFood(f: FoodResponse) {
        const key = f.barcode ?? f.name;
        try {
            await createFood({
                name: f.name, barcode: f.barcode, imageUrl: f.imageUrl, category: f.category,
                caloriesPer100g: f.caloriesPer100g, proteinPer100g: f.proteinPer100g,
                carbsPer100g: f.carbsPer100g, fatPer100g: f.fatPer100g,
            });
            setAdded((p) => new Set(p).add(key));
            loadFoods(search);
        } catch { /* ignore */ }
    }

    async function changeCategory(f: FoodResponse, cat: string) {
        if (f.id == null) return;
        await updateFood(f.id, {
            name: f.name, barcode: f.barcode, imageUrl: f.imageUrl, category: cat,
            caloriesPer100g: f.caloriesPer100g, proteinPer100g: f.proteinPer100g,
            carbsPer100g: f.carbsPer100g, fatPer100g: f.fatPer100g,
        });
        setExpandedId(null);
        loadFoods(search);
    }

    return (
        <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.card}>
                <Text style={styles.title}>Dodaj namirnicu ručno</Text>
                <Text style={styles.label}>Naziv</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
                <Text style={styles.label}>Kategorija</Text>
                <View style={styles.chipRow}>
                    {CATEGORIES.map((c) => (
                        <TouchableOpacity key={c.v} style={[styles.chip, category === c.v && styles.chipActive]} onPress={() => setCategory(c.v)}>
                            <Text style={[styles.chipText, category === c.v && styles.chipTextActive]}>{c.l}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.row}>
                    <View style={styles.half}><Text style={styles.label}>Kalorije</Text><TextInput style={styles.input} keyboardType="numeric" value={calories} onChangeText={setCalories} /></View>
                    <View style={styles.half}><Text style={styles.label}>Bjelančevine</Text><TextInput style={styles.input} keyboardType="numeric" value={protein} onChangeText={setProtein} /></View>
                </View>
                <View style={styles.row}>
                    <View style={styles.half}><Text style={styles.label}>Ugljikohidrati</Text><TextInput style={styles.input} keyboardType="numeric" value={carbs} onChangeText={setCarbs} /></View>
                    <View style={styles.half}><Text style={styles.label}>Masti</Text><TextInput style={styles.input} keyboardType="numeric" value={fat} onChangeText={setFat} /></View>
                </View>
                <TouchableOpacity style={styles.button} onPress={addManual}><Text style={styles.buttonText}>Dodaj</Text></TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Pretraži OpenFoodFacts 🌍</Text>
                <View style={styles.searchRow}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="npr. nutella..." value={extQuery} onChangeText={setExtQuery} />
                    <TouchableOpacity style={styles.searchBtn} onPress={extSearch} disabled={extLoading}><Text style={styles.buttonText}>{extLoading ? "..." : "Traži"}</Text></TouchableOpacity>
                </View>
                {extResults.map((f, i) => {
                    const key = f.barcode ?? f.name;
                    const isAdded = added.has(key);
                    return (
                        <View key={f.barcode ?? i} style={styles.foodRow}>
                            {f.imageUrl ? <Image source={{ uri: f.imageUrl }} style={styles.thumb} /> : <View style={styles.thumb} />}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{f.name}</Text>
                                <Text style={styles.itemMeta}>{f.caloriesPer100g} kcal / 100g</Text>
                            </View>
                            <TouchableOpacity style={[styles.smallBtn, isAdded && { backgroundColor: colors.oliveDark }]} onPress={() => importFood(f)} disabled={isAdded}>
                                <Text style={styles.buttonText}>{isAdded ? "✓" : "Dodaj"}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Moje namirnice</Text>
                <TextInput style={styles.input} placeholder="Pretraži svoje..." value={search} onChangeText={setSearch} />
                {foods.length === 0 ? (
                    <Text style={styles.muted}>Nema namirnica.</Text>
                ) : (
                    foods.map((f) => (
                        <View key={f.id}>
                            <TouchableOpacity style={styles.foodRow} onPress={() => setExpandedId(expandedId === f.id ? null : f.id)}>
                                {f.imageUrl ? <Image source={{ uri: f.imageUrl }} style={styles.thumb} /> : <View style={styles.thumb} />}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{f.name}</Text>
                                    <Text style={styles.itemMeta}>{f.caloriesPer100g} kcal / 100g</Text>
                                </View>
                                <Text style={styles.catTag}>{CATEGORY_LABELS[f.category ?? "OTHER"]} ▾</Text>
                            </TouchableOpacity>
                            {expandedId === f.id && (
                                <View style={[styles.chipRow, { marginTop: 6, marginBottom: 10 }]}>
                                    {CATEGORIES.map((c) => (
                                        <TouchableOpacity key={c.v} style={[styles.chip, f.category === c.v && styles.chipActive]} onPress={() => changeCategory(f, c.v)}>
                                            <Text style={[styles.chipText, f.category === c.v && styles.chipTextActive]}>{c.l}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
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
    label: { fontSize: 13, fontWeight: "600", color: colors.muted, marginBottom: 6, marginTop: 6 },
    muted: { color: colors.muted, fontSize: 13 },
    input: { backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 6 },
    row: { flexDirection: "row", gap: 10 },
    half: { flex: 1 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
    chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fcfdfa" },
    chipActive: { backgroundColor: colors.oliveSoft, borderColor: colors.olive },
    chipText: { color: colors.text, fontSize: 13 },
    chipTextActive: { color: colors.oliveDark, fontWeight: "700" },
    button: { backgroundColor: colors.olive, borderRadius: 12, padding: 13, alignItems: "center", marginTop: 14 },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    searchRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
    searchBtn: { backgroundColor: colors.olive, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 6 },
    foodRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.oliveSoft },
    itemName: { fontWeight: "700", color: colors.text },
    itemMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
    smallBtn: { backgroundColor: colors.olive, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
    catTag: { color: colors.oliveDark, fontSize: 12, fontWeight: "700" },
});
