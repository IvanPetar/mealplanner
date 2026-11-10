import { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scanBarcode, type ScanResponse } from "../api/scan";
import { createFood } from "../api/food";
import { logout } from "../api/auth";

export default function ScannerScreen({ onLogout }: { onLogout: () => void }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScanResponse | null>(null);
    const [error, setError] = useState("");
    const lockRef = useRef(false);
    const [added, setAdded] = useState(false);

    async function handleScanned({ data }: { data: string }) {
        if (lockRef.current) return;
        lockRef.current = true;
        setScanning(false);
        setLoading(true);
        setError("");
        setResult(null);
        try {
            setResult(await scanBarcode(data));
        } catch {
            setError("Proizvod nije pronađen u bazi.");
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        lockRef.current = false;
        setAdded(false);
        setResult(null);
        setError("");
        setScanning(true);
    }

    async function addToMyFoods() {
        if (!result) return;
        try {
            await createFood({
                name: result.food.name,
                barcode: result.food.barcode,
                imageUrl: result.food.imageUrl,
                category: result.food.category,
                caloriesPer100g: result.food.caloriesPer100g,
                proteinPer100g: result.food.proteinPer100g,
                carbsPer100g: result.food.carbsPer100g,
                fatPer100g: result.food.fatPer100g,
            });
            setAdded(true);
        } catch {
            Alert.alert("Greška", "Dodavanje nije uspjelo.");
        }
    }

    async function handleLogout() {
        await logout();
        onLogout();
    }

    if (!permission) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#6b8e23" /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Za skeniranje barkoda trebamo pristup kameri.</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Dopusti kameru</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {scanning ? (
                <CameraView
                    style={{ flex: 1 }}
                    barcodeScannerSettings={{
                        barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "code128"],
                    }}
                    onBarcodeScanned={handleScanned}
                >
                    <View style={styles.overlay}>
                        <View style={styles.frame} />
                        <Text style={styles.overlayText}>Usmjeri kameru na barkod proizvoda</Text>
                    </View>
                </CameraView>
            ) : (
                <ScrollView contentContainerStyle={styles.resultContainer}>
                    {loading && <ActivityIndicator size="large" color="#6b8e23" style={{ marginTop: 40 }} />}
                    {error !== "" && <Text style={styles.error}>{error}</Text>}

                    {result && (
                        <>
                            {result.food.imageUrl && (
                                <Image source={{ uri: result.food.imageUrl }} style={styles.foodImage} />
                            )}
                            <Text style={styles.foodName}>{result.food.name}</Text>
                            <Text style={styles.macros}>{result.food.caloriesPer100g} kcal / 100g</Text>
                            <Text style={styles.macros}>
                                B {result.food.proteinPer100g}g · U {result.food.carbsPer100g}g · M {result.food.fatPer100g}g
                            </Text>

                            {result.allergenWarnings.length > 0 ? (
                                <View style={styles.warningBox}>
                                    <Text style={styles.warningTitle}>⚠️ Sadrži tvoje alergene:</Text>
                                    {result.allergenWarnings.map((a) => (
                                        <Text key={a.id} style={styles.warningItem}>• {a.name}</Text>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.safeBox}>
                                    <Text style={styles.safeText}>✓ Nema tvojih alergena</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.addBtn, added && styles.addBtnDone]}
                                onPress={addToMyFoods}
                                disabled={added}
                            >
                                <Text style={styles.buttonText}>{added ? "Dodano u bazu ✓" : "Dodaj u moju bazu"}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.button} onPress={reset}>
                        <Text style={styles.buttonText}>Skeniraj ponovno</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            <TouchableOpacity style={styles.logout} onPress={handleLogout}>
                <Text style={styles.logoutText}>Odjava</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28, backgroundColor: "#f6f7f1" },
    info: { fontSize: 16, color: "#2e3320", textAlign: "center", marginBottom: 16 },
    overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
    frame: { width: 250, height: 160, borderWidth: 3, borderColor: "#fff", borderRadius: 16, marginBottom: 20 },
    overlayText: { color: "#fff", fontSize: 16, fontWeight: "600", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    resultContainer: { padding: 24, alignItems: "center", backgroundColor: "#f6f7f1", flexGrow: 1 },
    foodImage: { width: 120, height: 120, borderRadius: 16, marginBottom: 16, backgroundColor: "#fff" },
    foodName: { fontSize: 22, fontWeight: "800", color: "#2e3320", textAlign: "center", marginBottom: 6 },
    macros: { fontSize: 15, color: "#7a7f6e", marginBottom: 2 },
    error: { fontSize: 16, color: "#c0392b", marginTop: 40, marginBottom: 20 },
    warningBox: { backgroundColor: "#fdecea", borderWidth: 1, borderColor: "#f5c6c0", borderRadius: 14, padding: 16, marginTop: 20, width: "100%" },
    warningTitle: { color: "#c0392b", fontWeight: "800", fontSize: 16, marginBottom: 8 },
    warningItem: { color: "#c0392b", fontSize: 15 },
    safeBox: { backgroundColor: "#eef2e0", borderRadius: 14, padding: 16, marginTop: 20, width: "100%", alignItems: "center" },
    safeText: { color: "#55731c", fontWeight: "700", fontSize: 16 },
    button: { backgroundColor: "#6b8e23", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 28, alignSelf: "stretch" },
    addBtn: { backgroundColor: "#6b8e23", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 20, alignSelf: "stretch" },
    addBtnDone: { backgroundColor: "#55731c" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    logout: { position: "absolute", top: 12, right: 16, backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    logoutText: { color: "#fff", fontWeight: "600" },
});
