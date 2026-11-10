package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "Poruka je obavezna")
        String message
) {
}