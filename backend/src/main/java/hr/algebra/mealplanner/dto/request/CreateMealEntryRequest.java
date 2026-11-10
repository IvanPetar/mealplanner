package hr.algebra.mealplanner.dto.request;

import hr.algebra.mealplanner.enums.MealType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateMealEntryRequest(

        @NotNull(message = "Namirnica je obavezna")
        Long foodId,

        @NotNull(message = "Količina je obavezna")
        @Positive(message = "Količina mora biti veća od 0")
        Double quantityGrams,

        @NotNull(message = "Vrsta obroka je obavezna")
        MealType mealType,

        @NotNull(message = "Datum je obavezan")
        LocalDate date
) {
}