import api from "./axios";

export interface ChatResponse {
    reply: string;
}

export async function sendChatMessage(message: string): Promise<string> {
    const response = await api.post<ChatResponse>("/chat", { message });
    return response.data.reply;
}
