import api from "./client";

export interface AllergenResponse {
    id: number;
    name: string;
}

export async function getAllergens(): Promise<AllergenResponse[]> {
    const res = await api.get<AllergenResponse[]>("/allergens");
    return res.data;
}

export async function createAllergen(name: string): Promise<AllergenResponse> {
    const res = await api.post<AllergenResponse>("/allergens", { name });
    return res.data;
}

export async function getUserAllergens(): Promise<AllergenResponse[]> {
    const res = await api.get<AllergenResponse[]>("/users/me/allergens");
    return res.data;
}

export async function updateUserAllergens(allergenIds: number[]): Promise<AllergenResponse[]> {
    const res = await api.put<AllergenResponse[]>("/users/me/allergens", { allergenIds });
    return res.data;
}
