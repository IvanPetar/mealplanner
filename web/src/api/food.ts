import api from "./axios";

export interface FoodResponse {
    id: number | null;
    name: string;
    barcode: string | null;
    imageUrl: string | null;
    category: string | null;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
}

export interface CreateFoodRequest {
    name: string;
    barcode?: string | null;
    imageUrl?: string | null;
    category?: string | null;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
}

export async function getFoods(search?: string): Promise<FoodResponse[]> {
    const response = await api.get<FoodResponse[]>("/foods", {
        params: search ? { search } : {},
    });
    return response.data;
}

export async function createFood(data: CreateFoodRequest): Promise<FoodResponse> {
    const response = await api.post<FoodResponse>("/foods", data);
    return response.data;
}

export async function searchExternalFoods(query: string): Promise<FoodResponse[]> {
    const response = await api.get<FoodResponse[]>("/foods/external", {
        params: { query },
    });
    return response.data;
}

export async function updateFood(id: number, data: CreateFoodRequest): Promise<FoodResponse> {
    const response = await api.put<FoodResponse>(`/foods/${id}`, data);
    return response.data;
}
