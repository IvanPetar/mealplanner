package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangeEmailRequest(

        @NotBlank(message = "Novi email je obavezan")
        @Email(message = "Email nije u ispravnom formatu")
        String newEmail,

        @NotBlank(message = "Lozinka je obavezna")
        String currentPassword
) {
}
