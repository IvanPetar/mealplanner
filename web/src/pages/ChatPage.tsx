import { useState, useEffect, useRef, type FormEvent } from "react";
import { sendChatMessage } from "../api/chat";
import Topbar from "../components/Topbar";

interface Message {
    role: "user" | "assistant";
    text: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            text: "Bok! 👋 Ja sam tvoj AI asistent za prehranu. Pitaj me o kalorijama, makronutrijentima, obrocima ili zamjenama namirnica — odgovaram na temelju tvog profila i cilja.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleSend(e: FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        setLoading(true);
        try {
            const reply = await sendChatMessage(text);
            setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "Greška: AI asistent trenutno nije dostupan." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Topbar />
            <div className="page">
                <div className="card">
                    <h1 className="card-title">AI asistent 🤖</h1>
                    <p className="card-subtitle">
                        Pitaj o prehrani, kalorijama ili planu — odgovor uzima u obzir tvoj profil i cilj.
                    </p>

                    <div className="chat-window">
                        {messages.length === 0 && (
                            <p className="chat-empty">Npr. „Koliko bjelančevina trebam dnevno?"</p>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble ${m.role}`}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div className="chat-bubble assistant">…</div>}
                        <div ref={bottomRef} />
                    </div>

                    <form className="chat-input-row" onSubmit={handleSend}>
                        <input
                            className="field-input"
                            placeholder="Napiši pitanje..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button className="btn" type="submit" disabled={loading}>
                            Pošalji
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
