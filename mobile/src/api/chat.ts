import api from "./client";

export async function sendChatMessage(message: string): Promise<string> {
    const res = await api.post<{ reply: string }>("/chat", { message });
    return res.data.reply;
}
