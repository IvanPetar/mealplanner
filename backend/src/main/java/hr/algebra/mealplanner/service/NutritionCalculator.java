package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.response.NutritionResponse;
import hr.algebra.mealplanner.enums.ActivityLevel;
import hr.algebra.mealplanner.enums.Gender;
import hr.algebra.mealplanner.enums.Goal;
import org.springframework.stereotype.Component;

@Component
public class NutritionCalculator {

    private static final double CALORIE_ADJUSTMENT = 500.0;

    private static final double PROTEIN_RATIO = 0.30;
    private static final double CARBS_RATIO = 0.40;
    private static final double FAT_RATIO = 0.30;

    private static final int KCAL_PER_GRAM_PROTEIN = 4;
    private static final int KCAL_PER_GRAM_CARBS = 4;
    private static final int KCAL_PER_GRAM_FAT = 9;

    public NutritionResponse calculate(Gender gender, int age, int height, double weight,
                                       ActivityLevel activityLevel, Goal goal) {
        double bmr = calculateBmr(gender, age, height, weight);
        double tdee = bmr * activityMultiplier(activityLevel);
        double targetCalories = applyGoal(tdee, goal);

        int calories = (int) Math.round(targetCalories);
        int protein = (int) Math.round(targetCalories * PROTEIN_RATIO / KCAL_PER_GRAM_PROTEIN);
        int carbs = (int) Math.round(targetCalories * CARBS_RATIO / KCAL_PER_GRAM_CARBS);
        int fat = (int) Math.round(targetCalories * FAT_RATIO / KCAL_PER_GRAM_FAT);

        return new NutritionResponse(calories, protein, carbs, fat);
    }

    private double calculateBmr(Gender gender, int age, int height, double weight) {
        double base = 10 * weight + 6.25 * height - 5 * age;
        return switch (gender) {
            case MALE -> base + 5;
            case FEMALE -> base - 161;
        };
    }

    private double activityMultiplier(ActivityLevel activityLevel) {
        return switch (activityLevel) {
            case SEDENTARY -> 1.2;
            case LIGHT -> 1.375;
            case MODERATE -> 1.55;
            case ACTIVE -> 1.725;
            case VERY_ACTIVE -> 1.9;
        };
    }

    private double applyGoal(double tdee, Goal goal) {
        return switch (goal) {
            case LOSE_WEIGHT -> tdee - CALORIE_ADJUSTMENT;
            case MAINTAIN_WEIGHT -> tdee;
            case GAIN_WEIGHT -> tdee + CALORIE_ADJUSTMENT;
        };
    }
}