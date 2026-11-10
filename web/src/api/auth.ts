import api from "./axios";

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    email: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: string | null;
    activityLevel: string | null;
    goal: string | null;
    createdAt: string;
}

export async function register(data: RegisterRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>("/auth/register", data);
    return response.data;
}

export async function login(data: LoginRequest): Promise<void> {
    await api.post("/auth/login", data);
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}

export async function getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/users/me");
    return response.data;
}
