package hr.algebra.mealplanner.dto.request;

import hr.algebra.mealplanner.enums.ActivityLevel;
import hr.algebra.mealplanner.enums.Gender;
import hr.algebra.mealplanner.enums.Goal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateProfileRequest(

        @NotNull(message = "Dob je obavezna")
        @Min(value = 1, message = "Dob mora biti veća od 0")
        @Max(value = 120, message = "Dob mora biti manja od 120")
        Integer age,

        @NotNull(message = "Visina je obavezna")
        @Min(value = 50, message = "Visina mora biti barem 50 cm")
        @Max(value = 300, message = "Visina mora biti manja od 300 cm")
        Integer height,

        @NotNull(message = "Težina je obavezna")
        @Min(value = 20, message = "Težina mora biti barem 20 kg")
        @Max(value = 500, message = "Težina mora biti manja od 500 kg")
        Double weight,

        @NotNull(message = "Spol je obavezan")
        Gender gender,

        @NotNull(message = "Razina aktivnosti je obavezna")
        ActivityLevel activityLevel,

        @NotNull(message = "Cilj je obavezan")
        Goal goal
) {
}