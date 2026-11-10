package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateFoodRequest(

        @NotBlank(message = "Naziv je obavezan")
        String name,

        String barcode,

        String imageUrl,

        String category,

        @NotNull(message = "Kalorije su obavezne")
        @PositiveOrZero(message = "Kalorije ne mogu biti negativne")
        Double caloriesPer100g,

        @NotNull(message = "Bjelančevine su obavezne")
        @PositiveOrZero(message = "Bjelančevine ne mogu biti negativne")
        Double proteinPer100g,

        @NotNull(message = "Ugljikohidrati su obavezni")
        @PositiveOrZero(message = "Ugljikohidrati ne mogu biti negativni")
        Double carbsPer100g,

        @NotNull(message = "Masti su obavezne")
        @PositiveOrZero(message = "Masti ne mogu biti negativne")
        Double fatPer100g
) {
}