package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.response.DailyLogResponse;
import hr.algebra.mealplanner.dto.response.DailyProgressResponse;
import hr.algebra.mealplanner.dto.response.NutritionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final UserService userService;
    private final MealEntryService mealEntryService;

    public DailyProgressResponse getDailyProgress(String email, LocalDate date) {
        NutritionResponse target = userService.getNutrition(email);
        DailyLogResponse log = mealEntryService.getDailyLog(email, date);

        int caloriePercentage = target.calories() == 0
                ? 0
                : (int) Math.round(log.totalCalories() * 100.0 / target.calories());

        return new DailyProgressResponse(
                date,
                target.calories(), log.totalCalories(),
                target.calories() - log.totalCalories(), caloriePercentage,
                target.protein(), log.totalProtein(), target.protein() - log.totalProtein(),
                target.carbs(), log.totalCarbs(), target.carbs() - log.totalCarbs(),
                target.fat(), log.totalFat(), target.fat() - log.totalFat()
        );
    }
}