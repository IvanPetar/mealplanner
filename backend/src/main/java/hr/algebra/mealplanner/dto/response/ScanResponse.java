package hr.algebra.mealplanner.dto.response;

import java.util.List;

public record ScanResponse(
        FoodResponse food,
        List<AllergenResponse> allergenWarnings
) {
}