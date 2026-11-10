package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.entity.MealEntry;
import hr.algebra.mealplanner.enums.MealType;

import java.time.LocalDate;

public record MealEntryResponse(
        Long id,
        Long foodId,
        String foodName,
        Double quantityGrams,
        MealType mealType,
        LocalDate date,
        int calories,
        int protein,
        int carbs,
        int fat
) {
    public static MealEntryResponse from(MealEntry entry) {
        Food food = entry.getFood();
        double factor = entry.getQuantityGrams() / 100.0;
        return new MealEntryResponse(
                entry.getId(),
                food.getId(),
                food.getName(),
                entry.getQuantityGrams(),
                entry.getMealType(),
                entry.getDate(),
                (int) Math.round(food.getCaloriesPer100g() * factor),
                (int) Math.round(food.getProteinPer100g() * factor),
                (int) Math.round(food.getCarbsPer100g() * factor),
                (int) Math.round(food.getFatPer100g() * factor)
        );
    }
}