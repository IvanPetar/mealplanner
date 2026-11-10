package hr.algebra.mealplanner.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DailyLogResponse(
        LocalDate date,
        int totalCalories,
        int totalProtein,
        int totalCarbs,
        int totalFat,
        List<MealEntryResponse> entries
) {
}