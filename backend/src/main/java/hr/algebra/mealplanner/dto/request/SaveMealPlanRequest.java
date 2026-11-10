package hr.algebra.mealplanner.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record SaveMealPlanRequest(

        @NotNull(message = "Datum je obavezan")
        LocalDate date,

        @NotNull(message = "Ciljne kalorije su obavezne")
        Integer targetCalories,

        @Valid
        @NotEmpty(message = "Plan mora imati barem jednu stavku")
        List<MealPlanItemRequest> items
) {
}