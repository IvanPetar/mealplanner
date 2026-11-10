package hr.algebra.mealplanner.controller;

import hr.algebra.mealplanner.dto.request.UpdateAllergensRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.dto.response.UserResponse;
import hr.algebra.mealplanner.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import hr.algebra.mealplanner.dto.request.UpdateProfileRequest;
import hr.algebra.mealplanner.dto.request.ChangePasswordRequest;
import hr.algebra.mealplanner.dto.request.ChangeEmailRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import hr.algebra.mealplanner.dto.response.NutritionResponse;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getByEmail(userDetails.getUsername()));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/me/nutrition")
    public ResponseEntity<NutritionResponse> getNutrition(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getNutrition(userDetails.getUsername()));
    }

    @GetMapping("/me/allergens")
    public ResponseEntity<List<AllergenResponse>> getMyAllergens(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserAllergens(userDetails.getUsername()));
    }

    @PutMapping("/me/allergens")
    public ResponseEntity<List<AllergenResponse>> updateAllergens(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateAllergensRequest request) {
        return ResponseEntity.ok(userService.updateAllergens(userDetails.getUsername(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                               @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/email")
    public ResponseEntity<UserResponse> changeEmail(@AuthenticationPrincipal UserDetails userDetails,
                                                    @Valid @RequestBody ChangeEmailRequest request) {
        return ResponseEntity.ok(userService.changeEmail(userDetails.getUsername(), request));
    }
}