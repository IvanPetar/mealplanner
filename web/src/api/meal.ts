import api from "./axios";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export interface MealEntryResponse {
    id: number;
    foodId: number;
    foodName: string;
    quantityGrams: number;
    mealType: MealType;
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface DailyLogResponse {
    date: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    entries: MealEntryResponse[];
}

export interface CreateMealEntryRequest {
    foodId: number;
    quantityGrams: number;
    mealType: MealType;
    date: string;
}

export interface DailyProgressResponse {
    date: string;
    targetCalories: number;
    consumedCalories: number;
    remainingCalories: number;
    caloriePercentage: number;
    targetProtein: number;
    consumedProtein: number;
    remainingProtein: number;
    targetCarbs: number;
    consumedCarbs: number;
    remainingCarbs: number;
    targetFat: number;
    consumedFat: number;
    remainingFat: number;
}

export async function logMeal(data: CreateMealEntryRequest): Promise<MealEntryResponse> {
    const res = await api.post<MealEntryResponse>("/meal-entries", data);
    return res.data;
}

export async function getDailyLog(date: string): Promise<DailyLogResponse> {
    const res = await api.get<DailyLogResponse>("/meal-entries", { params: { date } });
    return res.data;
}

export async function deleteMealEntry(id: number): Promise<void> {
    await api.delete(`/meal-entries/${id}`);
}

export async function getDailyProgress(date: string): Promise<DailyProgressResponse> {
    const res = await api.get<DailyProgressResponse>("/progress", { params: { date } });
    return res.data;
}
