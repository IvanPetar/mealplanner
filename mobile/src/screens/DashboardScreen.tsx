import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { getProfile, getNutrition, type UserResponse, type NutritionResponse } from "../api/user";
import { colors } from "../theme";

const HERO = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=70";

export default function DashboardScreen({ navigation }: any) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [nutrition, setNutrition] = useState<NutritionResponse | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            setUser(await getProfile());
        } catch {
            // ignore
        }
        try {
            setNutrition(await getNutrition());
        } catch {
            setNutrition(null);
        }
        setLoading(false);
    }

    useEffect(() => {
        const unsub = navigation.addListener("focus", load);
        return unsub;
    }, [navigation]);

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={colors.olive} /></View>;
    }

    return (
        <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
            <ImageBackground source={{ uri: HERO }} style={styles.hero} imageStyle={{ borderRadius: 16 }}>
                <View style={styles.heroOverlay}>
                    <Text style={styles.heroTitle}>Zdrava prehrana 🥗</Text>
                    <Text style={styles.heroSub}>{user?.email}</Text>
                </View>
            </ImageBackground>

            {nutrition ? (
                <>
                    <View style={styles.bigCard}>
                        <Text style={styles.bigValue}>{nutrition.calories}</Text>
                        <Text style={styles.bigLabel}>kcal / dan</Text>
                    </View>
                    <View style={styles.macroRow}>
                        <View style={styles.macroCard}>
                            <Text style={styles.macroValue}>{nutrition.protein} g</Text>
                            <Text style={styles.macroLabel}>Bjelančevine</Text>
                        </View>
                        <View style={styles.macroCard}>
                            <Text style={styles.macroValue}>{nutrition.carbs} g</Text>
                            <Text style={styles.macroLabel}>Ugljikohidrati</Text>
                        </View>
                        <View style={styles.macroCard}>
                            <Text style={styles.macroValue}>{nutrition.fat} g</Text>
                            <Text style={styles.macroLabel}>Masti</Text>
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>Popuni profil da izračunamo tvoje dnevne kalorije.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Profil")}>
                        <Text style={styles.buttonText}>Popuni profil</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    container: { padding: 20 },
    hero: { height: 160, marginBottom: 20, justifyContent: "flex-end", borderRadius: 16, overflow: "hidden" },
    heroOverlay: { padding: 16, backgroundColor: "rgba(46,51,32,0.45)" },
    heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
    heroSub: { color: "#fff", opacity: 0.9, fontSize: 14, marginTop: 2 },
    greeting: { fontSize: 24, fontWeight: "800", color: colors.text },
    email: { fontSize: 15, color: colors.muted, marginBottom: 20 },
    bigCard: { backgroundColor: colors.olive, borderRadius: 18, padding: 26, alignItems: "center", marginBottom: 14 },
    bigValue: { fontSize: 44, fontWeight: "800", color: "#fff" },
    bigLabel: { fontSize: 14, color: "#fff", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    macroRow: { flexDirection: "row", gap: 10 },
    macroCard: { flex: 1, backgroundColor: colors.oliveSoft, borderRadius: 14, padding: 14, alignItems: "center" },
    macroValue: { fontSize: 18, fontWeight: "800", color: colors.text },
    macroLabel: { fontSize: 11, color: colors.muted, marginTop: 4, textAlign: "center" },
    notice: { backgroundColor: "#fff8e6", borderWidth: 1, borderColor: "#f2e2b6", borderRadius: 14, padding: 20, alignItems: "center" },
    noticeText: { color: colors.text, fontSize: 15, textAlign: "center", marginBottom: 14 },
    button: { backgroundColor: colors.olive, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
