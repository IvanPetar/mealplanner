package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.Allergen;

public record AllergenResponse(Long id, String name) {
    public static AllergenResponse from(Allergen allergen) {
        return new AllergenResponse(allergen.getId(), allergen.getName());
    }
}