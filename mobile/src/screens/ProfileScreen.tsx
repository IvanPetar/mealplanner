import { useEffect, useState } from "react";
import {
    View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { getProfile, updateProfile, changeEmail, changePassword } from "../api/user";
import {
    getAllergens, createAllergen, getUserAllergens, updateUserAllergens, type AllergenResponse,
} from "../api/allergen";
import { colors } from "../theme";

const GENDERS = [{ v: "MALE", l: "Muško" }, { v: "FEMALE", l: "Žensko" }];
const ACTIVITIES = [
    { v: "SEDENTARY", l: "Sjedilački" }, { v: "LIGHT", l: "Lagana" },
    { v: "MODERATE", l: "Umjerena" }, { v: "ACTIVE", l: "Aktivan" }, { v: "VERY_ACTIVE", l: "Vrlo aktivan" },
];
const GOALS = [
    { v: "LOSE_WEIGHT", l: "Mršavljenje" }, { v: "MAINTAIN_WEIGHT", l: "Održavanje" }, { v: "GAIN_WEIGHT", l: "Debljanje" },
];

function Chips({ options, value, onChange }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
    return (
        <View style={styles.chipRow}>
            {options.map((o) => (
                <TouchableOpacity key={o.v} style={[styles.chip, value === o.v && styles.chipActive]} onPress={() => onChange(o.v)}>
                    <Text style={[styles.chipText, value === o.v && styles.chipTextActive]}>{o.l}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
    const [loading, setLoading] = useState(true);
    const [age, setAge] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [gender, setGender] = useState("");
    const [activityLevel, setActivityLevel] = useState("");
    const [goal, setGoal] = useState("");

    const [allergens, setAllergens] = useState<AllergenResponse[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [newAllergen, setNewAllergen] = useState("");

    const [email, setEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [curPassword, setCurPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    async function load() {
        try {
            const p = await getProfile();
            setAge(p.age?.toString() ?? "");
            setHeight(p.height?.toString() ?? "");
            setWeight(p.weight?.toString() ?? "");
            setGender(p.gender ?? "");
            setActivityLevel(p.activityLevel ?? "");
            setGoal(p.goal ?? "");
            setEmail(p.email);
        } catch { /* ignore */ }
        try { setAllergens(await getAllergens()); } catch { /* ignore */ }
        try {
            const mine = await getUserAllergens();
            setSelected(new Set(mine.map((a) => a.id)));
        } catch { /* ignore */ }
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function saveProfile() {
        try {
            await updateProfile({
                age: Number(age), height: Number(height), weight: Number(weight),
                gender, activityLevel, goal,
            });
            Alert.alert("Spremljeno", "Profil je ažuriran.");
        } catch {
            Alert.alert("Greška", "Provjeri unesene vrijednosti.");
        }
    }

    function toggle(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    async function saveAllergens() {
        try {
            await updateUserAllergens([...selected]);
            Alert.alert("Spremljeno", "Alergeni su ažurirani.");
        } catch { Alert.alert("Greška", "Nije spremljeno."); }
    }

    async function addAllergen() {
        if (!newAllergen.trim()) return;
        await createAllergen(newAllergen.trim());
        setNewAllergen("");
        setAllergens(await getAllergens());
    }

    async function handleChangeEmail() {
        try {
            await changeEmail(email, emailPassword);
            Alert.alert("Email promijenjen", "Prijavi se ponovno s novim emailom.", [{ text: "OK", onPress: onLogout }]);
        } catch {
            Alert.alert("Greška", "Provjeri email i lozinku (možda je email zauzet).");
        }
    }

    async function handleChangePassword() {
        if (newPassword.length < 8) { Alert.alert("Greška", "Nova lozinka mora imati barem 8 znakova."); return; }
        try {
            await changePassword(curPassword, newPassword);
            setCurPassword("");
            setNewPassword("");
            Alert.alert("Uspjeh", "Lozinka je promijenjena.");
        } catch {
            Alert.alert("Greška", "Trenutna lozinka nije ispravna.");
        }
    }

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={colors.olive} /></View>;
    }

    return (
        <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Tvoj profil</Text>

                <Text style={styles.label}>Dob</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
                <Text style={styles.label}>Visina (cm)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />
                <Text style={styles.label}>Težina (kg)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} />

                <Text style={styles.label}>Spol</Text>
                <Chips options={GENDERS} value={gender} onChange={setGender} />
                <Text style={styles.label}>Razina aktivnosti</Text>
                <Chips options={ACTIVITIES} value={activityLevel} onChange={setActivityLevel} />
                <Text style={styles.label}>Cilj</Text>
                <Chips options={GOALS} value={goal} onChange={setGoal} />

                <TouchableOpacity style={styles.button} onPress={saveProfile}>
                    <Text style={styles.buttonText}>Spremi profil</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Moji alergeni</Text>
                {allergens.length === 0 ? (
                    <Text style={styles.muted}>Katalog je prazan. Dodaj alergen ispod.</Text>
                ) : (
                    <View style={styles.chipRow}>
                        {allergens.map((a) => (
                            <TouchableOpacity key={a.id} style={[styles.chip, selected.has(a.id) && styles.chipActive]} onPress={() => toggle(a.id)}>
                                <Text style={[styles.chipText, selected.has(a.id) && styles.chipTextActive]}>{a.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <TouchableOpacity style={styles.button} onPress={saveAllergens}>
                    <Text style={styles.buttonText}>Spremi alergene</Text>
                </TouchableOpacity>

                <View style={styles.addRow}>
                    <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Novi alergen..." value={newAllergen} onChangeText={setNewAllergen} />
                    <TouchableOpacity style={styles.addBtn} onPress={addAllergen}>
                        <Text style={styles.buttonText}>Dodaj</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Račun</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
                <Text style={styles.label}>Lozinka (potvrda)</Text>
                <TextInput style={styles.input} secureTextEntry value={emailPassword} onChangeText={setEmailPassword} />
                <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
                    <Text style={styles.buttonText}>Promijeni email</Text>
                </TouchableOpacity>

                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 18 }} />

                <Text style={styles.label}>Trenutna lozinka</Text>
                <TextInput style={styles.input} secureTextEntry value={curPassword} onChangeText={setCurPassword} />
                <Text style={styles.label}>Nova lozinka (min 8)</Text>
                <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>Promijeni lozinku</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logout} onPress={onLogout}>
                <Text style={styles.logoutText}>Odjava</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    container: { padding: 16 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 14 },
    label: { fontSize: 13, fontWeight: "600", color: colors.muted, marginBottom: 6, marginTop: 6 },
    input: { backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 6 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fcfdfa" },
    chipActive: { backgroundColor: colors.oliveSoft, borderColor: colors.olive },
    chipText: { color: colors.text, fontSize: 14 },
    chipTextActive: { color: colors.oliveDark, fontWeight: "700" },
    muted: { color: colors.muted, marginBottom: 8 },
    button: { backgroundColor: colors.olive, borderRadius: 12, padding: 13, alignItems: "center", marginTop: 14 },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    addRow: { flexDirection: "row", gap: 10, marginTop: 14, alignItems: "center" },
    addBtn: { backgroundColor: colors.olive, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
    logout: { alignItems: "center", padding: 14 },
    logoutText: { color: colors.danger, fontWeight: "700", fontSize: 15 },
});
