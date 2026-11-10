package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateAllergenRequest(
        @NotBlank(message = "Naziv alergena je obavezan")
        String name
) {
}