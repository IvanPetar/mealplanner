import api from "./client";
import * as SecureStore from "expo-secure-store";

export async function login(email: string, password: string): Promise<void> {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data.accessToken;
    await SecureStore.setItemAsync("accessToken", token);
}

export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync("accessToken");
}

export async function getToken(): Promise<string | null> {
    return SecureStore.getItemAsync("accessToken");
}
