import api from "./client";
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

export async function generatePlan(date: string): Promise<MealPlanResponse> {
    const res = await api.get<MealPlanResponse>("/meal-plans/generate", { params: { date } });
    return res.data;
}

export async function savePlan(plan: MealPlanResponse): Promise<MealPlanResponse> {
    const res = await api.post<MealPlanResponse>("/meal-plans", {
        date: plan.date,
        targetCalories: plan.targetCalories,
        items: plan.items.map((i) => ({
            foodId: i.foodId,
            mealType: i.mealType,
            quantityGrams: i.quantityGrams,
        })),
    });
    return res.data;
}

export async function getPlans(): Promise<MealPlanResponse[]> {
    const res = await api.get<MealPlanResponse[]>("/meal-plans");
    return res.data;
}

export async function deletePlan(id: number): Promise<void> {
    await api.delete(`/meal-plans/${id}`);
}
