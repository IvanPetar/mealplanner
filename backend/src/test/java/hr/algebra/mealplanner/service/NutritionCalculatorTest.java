package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.response.NutritionResponse;
import hr.algebra.mealplanner.enums.ActivityLevel;
import hr.algebra.mealplanner.enums.Gender;
import hr.algebra.mealplanner.enums.Goal;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NutritionCalculatorTest {

    private final NutritionCalculator calculator = new NutritionCalculator();

    @Test
    void maintainWeight_male_calculatesExpectedValues() {
        NutritionResponse result = calculator.calculate(
                Gender.MALE, 25, 180, 80.0, ActivityLevel.MODERATE, Goal.MAINTAIN_WEIGHT);

        // BMR = 10*80 + 6.25*180 - 5*25 + 5 = 1805
        // TDEE = 1805 * 1.55 = 2797.75 -> 2798
        assertEquals(2798, result.calories());
        assertEquals(210, result.protein());
        assertEquals(280, result.carbs());
        assertEquals(93, result.fat());
    }

    @Test
    void loseWeight_appliesDeficitOf500() {
        NutritionResponse maintain = calculator.calculate(
                Gender.MALE, 25, 180, 80.0, ActivityLevel.MODERATE, Goal.MAINTAIN_WEIGHT);
        NutritionResponse lose = calculator.calculate(
                Gender.MALE, 25, 180, 80.0, ActivityLevel.MODERATE, Goal.LOSE_WEIGHT);

        assertEquals(maintain.calories() - 500, lose.calories());
    }

    @Test
    void gainWeight_appliesSurplusOf500() {
        NutritionResponse maintain = calculator.calculate(
                Gender.MALE, 25, 180, 80.0, ActivityLevel.MODERATE, Goal.MAINTAIN_WEIGHT);
        NutritionResponse gain = calculator.calculate(
                Gender.MALE, 25, 180, 80.0, ActivityLevel.MODERATE, Goal.GAIN_WEIGHT);

        assertEquals(maintain.calories() + 500, gain.calories());
    }

    @Test
    void female_hasLowerCaloriesThanMale_forSameParameters() {
        NutritionResponse male = calculator.calculate(
                Gender.MALE, 30, 170, 70.0, ActivityLevel.SEDENTARY, Goal.MAINTAIN_WEIGHT);
        NutritionResponse female = calculator.calculate(
                Gender.FEMALE, 30, 170, 70.0, ActivityLevel.SEDENTARY, Goal.MAINTAIN_WEIGHT);

        assertTrue(female.calories() < male.calories());
    }

    @Test
    void higherActivityLevel_producesMoreCalories() {
        NutritionResponse sedentary = calculator.calculate(
                Gender.MALE, 28, 178, 75.0, ActivityLevel.SEDENTARY, Goal.MAINTAIN_WEIGHT);
        NutritionResponse veryActive = calculator.calculate(
                Gender.MALE, 28, 178, 75.0, ActivityLevel.VERY_ACTIVE, Goal.MAINTAIN_WEIGHT);

        assertTrue(veryActive.calories() > sedentary.calories());
    }
}
