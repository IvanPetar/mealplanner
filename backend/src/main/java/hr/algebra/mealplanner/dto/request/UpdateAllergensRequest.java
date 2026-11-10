package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateAllergensRequest(
        @NotNull(message = "Lista alergena je obavezna")
        List<Long> allergenIds
) {
}