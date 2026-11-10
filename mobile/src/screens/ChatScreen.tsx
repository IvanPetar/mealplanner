import { useState, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { sendChatMessage } from "../api/chat";
import { colors } from "../theme";

interface Msg { role: "user" | "assistant"; text: string; }

export default function ChatScreen() {
    const [messages, setMessages] = useState<Msg[]>([
        { role: "assistant", text: "Bok! 👋 Ja sam tvoj AI asistent za prehranu. Pitaj me o kalorijama, obrocima, zamjenama namirnica ili planu — odgovaram na temelju tvog profila i današnjeg unosa." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    async function send() {
        const text = input.trim();
        if (!text || loading) return;
        setMessages((p) => [...p, { role: "user", text }]);
        setInput("");
        setLoading(true);
        try {
            const reply = await sendChatMessage(text);
            setMessages((p) => [...p, { role: "assistant", text: reply }]);
        } catch {
            setMessages((p) => [...p, { role: "assistant", text: "Greška: AI asistent trenutno nije dostupan." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd()}>
                {messages.map((m, i) => (
                    <View key={i} style={[styles.bubble, m.role === "user" ? styles.user : styles.assistant]}>
                        <Text style={m.role === "user" ? styles.userText : styles.assistantText}>{m.text}</Text>
                    </View>
                ))}
                {loading && <View style={[styles.bubble, styles.assistant]}><Text style={styles.assistantText}>…</Text></View>}
            </ScrollView>
            <View style={styles.inputRow}>
                <TextInput style={styles.input} placeholder="Napiši pitanje..." value={input} onChangeText={setInput} />
                <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
                    <Text style={styles.sendText}>Pošalji</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    bubble: { maxWidth: "82%", padding: 11, borderRadius: 14, marginBottom: 8 },
    user: { alignSelf: "flex-end", backgroundColor: colors.olive, borderBottomRightRadius: 4 },
    assistant: { alignSelf: "flex-start", backgroundColor: colors.oliveSoft, borderBottomLeftRadius: 4 },
    userText: { color: "#fff", fontSize: 15 },
    assistantText: { color: colors.text, fontSize: 15 },
    inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
    input: { flex: 1, backgroundColor: "#fcfdfa", borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 15 },
    sendBtn: { backgroundColor: colors.olive, borderRadius: 10, paddingHorizontal: 18, justifyContent: "center" },
    sendText: { color: "#fff", fontWeight: "700" },
});
