import api from "./axios";
import type { UserResponse } from "./auth";

export interface UpdateProfileRequest {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activityLevel: string;
    goal: string;
}

export interface NutritionResponse {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const response = await api.put<UserResponse>("/users/me/profile", data);
    return response.data;
}

export async function getNutrition(): Promise<NutritionResponse> {
    const response = await api.get<NutritionResponse>("/users/me/nutrition");
    return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put("/users/me/password", { currentPassword, newPassword });
}

export async function changeEmail(newEmail: string, currentPassword: string): Promise<UserResponse> {
    const response = await api.put<UserResponse>("/users/me/email", { newEmail, currentPassword });
    return response.data;
}
