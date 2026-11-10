package hr.algebra.mealplanner.dto.response;

public record NutritionResponse(
        int calories,
        int protein,   // grami
        int carbs,     // grami
        int fat        // grami
) {
}