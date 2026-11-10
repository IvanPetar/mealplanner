import api from "./axios";
import type { MealType } from "./meal";

export interface MealPlanItemResponse {
    mealType: MealType;
    foodId: number;
    foodName: string;
    quantityGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MealPlanResponse {
    id: number | null;
    date: string;
    targetCalories: number;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    items: MealPlanItemResponse[];
}

export interface SaveMealPlanItem {
    foodId: number;
    mealType: MealType;
    quantityGrams: number;
}

export interface SaveMealPlanRequest {
    date: string;
    targetCalories: number;
    items: SaveMealPlanItem[];
}

export async function generatePlan(date: string): Promise<MealPlanResponse> {
    const res = await api.get<MealPlanResponse>("/meal-plans/generate", { params: { date } });
    return res.data;
}

export async function savePlan(data: SaveMealPlanRequest): Promise<MealPlanResponse> {
    const res = await api.post<MealPlanResponse>("/meal-plans", data);
    return res.data;
}

export async function getPlans(): Promise<MealPlanResponse[]> {
    const res = await api.get<MealPlanResponse[]>("/meal-plans");
    return res.data;
}

export async function deletePlan(id: number): Promise<void> {
    await api.delete(`/meal-plans/${id}`);
}
