package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.CreateFoodRequest;
import hr.algebra.mealplanner.dto.response.FoodResponse;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import hr.algebra.mealplanner.dto.request.UpdateAllergensRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.repository.AllergenRepository;
import hr.algebra.mealplanner.client.OpenFoodFactsClient;
import hr.algebra.mealplanner.enums.FoodCategory;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;
    private final AllergenRepository allergenRepository;
    private final OpenFoodFactsClient openFoodFactsClient;

    public FoodResponse create(CreateFoodRequest request) {
        if (request.barcode() != null && !request.barcode().isBlank()) {
            var existing = foodRepository.findByBarcode(request.barcode());
            if (existing.isPresent()) {
                return FoodResponse.from(existing.get());
            }
        }
        Food food = new Food();
        applyRequest(food, request);
        return FoodResponse.from(foodRepository.save(food));
    }

    public List<FoodResponse> searchExternal(String query) {
        return openFoodFactsClient.searchByName(query).stream()
                .map(FoodResponse::from)
                .toList();
    }

    public List<FoodResponse> getAll() {
        return foodRepository.findAll().stream()
                .map(FoodResponse::from)
                .toList();
    }

    public FoodResponse getById(Long id) {
        return FoodResponse.from(findFoodById(id));
    }

    public List<FoodResponse> search(String name) {
        return foodRepository.findByNameContainingIgnoreCase(name).stream()
                .map(FoodResponse::from)
                .toList();
    }

    public FoodResponse update(Long id, CreateFoodRequest request) {
        Food food = findFoodById(id);
        applyRequest(food, request);
        return FoodResponse.from(foodRepository.save(food));
    }

    public void delete(Long id) {
        foodRepository.delete(findFoodById(id));
    }

    private Food findFoodById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Namirnica nije pronađena: " + id));
    }

    private void applyRequest(Food food, CreateFoodRequest request) {
        food.setName(request.name());
        food.setBarcode(request.barcode());
        food.setImageUrl(request.imageUrl());
        food.setCategory(request.category() != null && !request.category().isBlank()
                ? FoodCategory.valueOf(request.category())
                : FoodCategory.OTHER);
        food.setCaloriesPer100g(request.caloriesPer100g());
        food.setProteinPer100g(request.proteinPer100g());
        food.setCarbsPer100g(request.carbsPer100g());
        food.setFatPer100g(request.fatPer100g());
    }
    @Transactional
    public List<AllergenResponse> updateAllergens(Long foodId, UpdateAllergensRequest request) {
        Food food = findFoodById(foodId);

        Set<Allergen> allergens = new HashSet<>(allergenRepository.findAllById(request.allergenIds()));
        food.setAllergens(allergens);
        foodRepository.save(food);

        return allergens.stream().map(AllergenResponse::from).toList();
    }
}