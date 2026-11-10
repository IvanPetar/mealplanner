package hr.algebra.mealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "Trenutna lozinka je obavezna")
        String currentPassword,

        @NotBlank(message = "Nova lozinka je obavezna")
        @Size(min = 8, message = "Nova lozinka mora imati barem 8 znakova")
        String newPassword
) {
}
