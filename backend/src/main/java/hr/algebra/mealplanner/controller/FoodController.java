package hr.algebra.mealplanner.controller;

import hr.algebra.mealplanner.dto.request.CreateFoodRequest;
import hr.algebra.mealplanner.dto.request.UpdateAllergensRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.dto.response.FoodResponse;
import hr.algebra.mealplanner.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public ResponseEntity<FoodResponse> create(@Valid @RequestBody CreateFoodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(foodService.search(search));
        }
        return ResponseEntity.ok(foodService.getAll());
    }

    @GetMapping("/external")
    public ResponseEntity<List<FoodResponse>> searchExternal(@RequestParam String query) {
        return ResponseEntity.ok(foodService.searchExternal(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody CreateFoodRequest request) {
        return ResponseEntity.ok(foodService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        foodService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/allergens")
    public ResponseEntity<List<AllergenResponse>> updateAllergens(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAllergensRequest request) {
        return ResponseEntity.ok(foodService.updateAllergens(id, request));
    }
}