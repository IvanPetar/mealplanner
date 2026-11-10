package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.MealPlan;

import java.time.LocalDate;
import java.util.List;

public record MealPlanResponse(
        Long id,
        LocalDate date,
        int targetCalories,
        int totalCalories,
        int totalProtein,
        int totalCarbs,
        int totalFat,
        List<MealPlanItemResponse> items
) {
    public static MealPlanResponse from(MealPlan plan) {
        List<MealPlanItemResponse> items = plan.getItems().stream()
                .map(MealPlanItemResponse::from)
                .toList();

        int totalCalories = items.stream().mapToInt(MealPlanItemResponse::calories).sum();
        int totalProtein = items.stream().mapToInt(MealPlanItemResponse::protein).sum();
        int totalCarbs = items.stream().mapToInt(MealPlanItemResponse::carbs).sum();
        int totalFat = items.stream().mapToInt(MealPlanItemResponse::fat).sum();

        return new MealPlanResponse(plan.getId(), plan.getDate(), plan.getTargetCalories(),
                totalCalories, totalProtein, totalCarbs, totalFat, items);
    }
}