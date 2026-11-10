package hr.algebra.mealplanner.dto.response;

import java.time.LocalDate;

public record DailyProgressResponse(
        LocalDate date,

        int targetCalories,
        int consumedCalories,
        int remainingCalories,
        int caloriePercentage,

        int targetProtein,
        int consumedProtein,
        int remainingProtein,

        int targetCarbs,
        int consumedCarbs,
        int remainingCarbs,

        int targetFat,
        int consumedFat,
        int remainingFat
) {
}