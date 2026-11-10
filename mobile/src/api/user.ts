import api from "./client";

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

export interface NutritionResponse {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface UpdateProfileRequest {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activityLevel: string;
    goal: string;
}

export async function getProfile(): Promise<UserResponse> {
    const res = await api.get<UserResponse>("/users/me");
    return res.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const res = await api.put<UserResponse>("/users/me/profile", data);
    return res.data;
}

export async function getNutrition(): Promise<NutritionResponse> {
    const res = await api.get<NutritionResponse>("/users/me/nutrition");
    return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put("/users/me/password", { currentPassword, newPassword });
}

export async function changeEmail(newEmail: string, currentPassword: string): Promise<UserResponse> {
    const res = await api.put<UserResponse>("/users/me/email", { newEmail, currentPassword });
    return res.data;
}
