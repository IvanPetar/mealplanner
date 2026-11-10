package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.Food;

public record FoodResponse(
        Long id,
        String name,
        String barcode,
        Double caloriesPer100g,
        Double proteinPer100g,
        Double carbsPer100g,
        Double fatPer100g,
        String imageUrl,
        String category
) {
    public static FoodResponse from(Food food) {
        return new FoodResponse(
                food.getId(),
                food.getName(),
                food.getBarcode(),
                food.getCaloriesPer100g(),
                food.getProteinPer100g(),
                food.getCarbsPer100g(),
                food.getFatPer100g(),
                food.getImageUrl(),
                food.getCategory() != null ? food.getCategory().name() : null
        );
    }
}