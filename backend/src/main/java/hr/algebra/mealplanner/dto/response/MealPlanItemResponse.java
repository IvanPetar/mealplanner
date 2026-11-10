package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.enums.MealType;

public record MealPlanItemResponse(
        MealType mealType,
        Long foodId,
        String foodName,
        int quantityGrams,
        int calories,
        int protein,
        int carbs,
        int fat
) {
    public static MealPlanItemResponse from(hr.algebra.mealplanner.entity.MealPlanItem item) {
        var food = item.getFood();
        double factor = item.getQuantityGrams() / 100.0;
        return new MealPlanItemResponse(
                item.getMealType(),
                food.getId(),
                food.getName(),
                (int) Math.round(item.getQuantityGrams()),
                (int) Math.round(food.getCaloriesPer100g() * factor),
                (int) Math.round(food.getProteinPer100g() * factor),
                (int) Math.round(food.getCarbsPer100g() * factor),
                (int) Math.round(food.getFatPer100g() * factor)
        );
    }
}