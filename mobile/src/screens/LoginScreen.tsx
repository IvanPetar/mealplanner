import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from "react-native";
import { login } from "../api/auth";
import { API_BASE } from "../api/client";

const BG = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=70";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setLoading(true);
        try {
            await login(email.trim(), password);
            onLogin();
        } catch (e: any) {
            if (e?.response) {
                Alert.alert("Greška", "Neispravan email ili lozinka.");
            } else {
                Alert.alert(
                    "Greška veze",
                    `Ne mogu se spojiti na server:\n${API_BASE}\n\nProvjeri:\n• backend je upaljen (8081)\n• telefon i PC na istom WiFi-u\n• firewall dopušta port 8081\n\n(${e?.message ?? "network error"})`
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.brand}>🥗 Meal Planner</Text>
                    <Text style={styles.subtitle}>Prijavi se u svoj račun</Text>

                    <TextInput style={styles.input} placeholder="Email" autoCapitalize="none"
                        keyboardType="email-address" value={email} onChangeText={setEmail} />
                    <TextInput style={styles.input} placeholder="Lozinka" secureTextEntry
                        value={password} onChangeText={setPassword} />

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "..." : "Prijavi se"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1 },
    overlay: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(46,51,32,0.35)" },
    card: {
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 20,
        padding: 28,
    },
    brand: { fontSize: 26, fontWeight: "800", color: "#2e3320", textAlign: "center" },
    subtitle: { fontSize: 15, color: "#7a7f6e", textAlign: "center", marginBottom: 24, marginTop: 4 },
    input: {
        backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: "#e2e5d6",
        borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12,
    },
    button: { backgroundColor: "#6b8e23", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 8 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
