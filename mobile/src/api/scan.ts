import api from "./client";

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

export interface AllergenResponse {
    id: number;
    name: string;
}

export interface ScanResponse {
    food: FoodResponse;
    allergenWarnings: AllergenResponse[];
}

export async function scanBarcode(barcode: string): Promise<ScanResponse> {
    const res = await api.get<ScanResponse>(`/mobile/scan/${barcode}`);
    return res.data;
}
