package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.entity.MealEntry;
import hr.algebra.mealplanner.enums.MealType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MealEntryResponseTest {

    @Test
    void from_calculatesNutritionForGivenQuantity() {
        Food food = new Food();
        food.setId(1L);
        food.setName("Pileća prsa");
        food.setCaloriesPer100g(100.0);
        food.setProteinPer100g(10.0);
        food.setCarbsPer100g(20.0);
        food.setFatPer100g(5.0);

        MealEntry entry = new MealEntry();
        entry.setFood(food);
        entry.setQuantityGrams(150.0);
        entry.setMealType(MealType.LUNCH);
        entry.setDate(LocalDate.of(2026, 8, 23));

        MealEntryResponse result = MealEntryResponse.from(entry);

        // factor = 150 / 100 = 1.5
        assertEquals(150, result.calories());
        assertEquals(15, result.protein());
        assertEquals(30, result.carbs());
        assertEquals(8, result.fat()); // 5 * 1.5 = 7.5 -> 8
        assertEquals("Pileća prsa", result.foodName());
        assertEquals(150.0, result.quantityGrams());
        assertEquals(MealType.LUNCH, result.mealType());
    }

    @Test
    void from_zeroQuantity_producesZeroNutrition() {
        Food food = new Food();
        food.setId(2L);
        food.setName("Voda");
        food.setCaloriesPer100g(0.0);
        food.setProteinPer100g(0.0);
        food.setCarbsPer100g(0.0);
        food.setFatPer100g(0.0);

        MealEntry entry = new MealEntry();
        entry.setFood(food);
        entry.setQuantityGrams(250.0);
        entry.setMealType(MealType.SNACK);
        entry.setDate(LocalDate.of(2026, 8, 23));

        MealEntryResponse result = MealEntryResponse.from(entry);

        assertEquals(0, result.calories());
        assertEquals(0, result.protein());
        assertEquals(0, result.carbs());
        assertEquals(0, result.fat());
    }
}
