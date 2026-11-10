package hr.algebra.mealplanner.controller;

import hr.algebra.mealplanner.dto.response.MealPlanResponse;
import hr.algebra.mealplanner.service.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import hr.algebra.mealplanner.dto.request.SaveMealPlanRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping("/generate")
    public ResponseEntity<MealPlanResponse> generate(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(mealPlanService.generate(userDetails.getUsername(), date));
    }

    @PostMapping
    public ResponseEntity<MealPlanResponse> save(@AuthenticationPrincipal UserDetails userDetails,
                                                 @Valid @RequestBody SaveMealPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealPlanService.savePlan(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<MealPlanResponse>> getUserPlans(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mealPlanService.getUserPlans(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealPlanResponse> getPlan(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long id) {
        return ResponseEntity.ok(mealPlanService.getPlan(userDetails.getUsername(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long id) {
        mealPlanService.deletePlan(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}