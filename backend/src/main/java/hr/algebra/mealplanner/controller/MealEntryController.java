package hr.algebra.mealplanner.controller;

import hr.algebra.mealplanner.dto.request.CreateMealEntryRequest;
import hr.algebra.mealplanner.dto.response.DailyLogResponse;
import hr.algebra.mealplanner.dto.response.MealEntryResponse;
import hr.algebra.mealplanner.service.MealEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/meal-entries")
@RequiredArgsConstructor
public class MealEntryController {

    private final MealEntryService mealEntryService;

    @PostMapping
    public ResponseEntity<MealEntryResponse> logMeal(@AuthenticationPrincipal UserDetails userDetails,
                                                     @Valid @RequestBody CreateMealEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealEntryService.logMeal(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<DailyLogResponse> getDailyLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(mealEntryService.getDailyLog(userDetails.getUsername(), date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long id) {
        mealEntryService.deleteEntry(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}