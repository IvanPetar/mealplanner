package hr.algebra.mealplanner.controller;

import hr.algebra.mealplanner.dto.request.CreateAllergenRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.service.AllergenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/allergens")
@RequiredArgsConstructor
public class AllergenController {

    private final AllergenService allergenService;

    @PostMapping
    public ResponseEntity<AllergenResponse> create(@Valid @RequestBody CreateAllergenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allergenService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<AllergenResponse>> getAll() {
        return ResponseEntity.ok(allergenService.getAll());
    }
}