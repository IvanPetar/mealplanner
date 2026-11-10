package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.CreateFoodRequest;
import hr.algebra.mealplanner.dto.response.FoodResponse;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.AllergenRepository;
import hr.algebra.mealplanner.repository.FoodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FoodServiceTest {

    private FoodRepository foodRepository;
    private AllergenRepository allergenRepository;
    private FoodService foodService;

    @BeforeEach
    void setUp() {
        foodRepository = mock(FoodRepository.class);
        allergenRepository = mock(AllergenRepository.class);
        foodService = new FoodService(foodRepository, allergenRepository);
    }

    @Test
    void create_savesAndReturnsResponse() {
        CreateFoodRequest request = new CreateFoodRequest("Jabuka", null, 52.0, 0.3, 14.0, 0.2);

        Food saved = new Food();
        saved.setId(1L);
        saved.setName("Jabuka");
        saved.setCaloriesPer100g(52.0);
        saved.setProteinPer100g(0.3);
        saved.setCarbsPer100g(14.0);
        saved.setFatPer100g(0.2);
        when(foodRepository.save(any(Food.class))).thenReturn(saved);

        FoodResponse result = foodService.create(request);

        assertEquals(1L, result.id());
        assertEquals("Jabuka", result.name());
        assertEquals(52.0, result.caloriesPer100g());
        verify(foodRepository).save(any(Food.class));
    }

    @Test
    void getById_existing_returnsResponse() {
        Food food = new Food();
        food.setId(5L);
        food.setName("Banana");
        food.setCaloriesPer100g(89.0);
        food.setProteinPer100g(1.1);
        food.setCarbsPer100g(23.0);
        food.setFatPer100g(0.3);
        when(foodRepository.findById(5L)).thenReturn(Optional.of(food));

        FoodResponse result = foodService.getById(5L);

        assertEquals("Banana", result.name());
        assertEquals(89.0, result.caloriesPer100g());
    }

    @Test
    void getById_missing_throwsResourceNotFound() {
        when(foodRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> foodService.getById(99L));
    }

    @Test
    void delete_missing_throwsAndDoesNotDelete() {
        when(foodRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> foodService.delete(99L));
        verify(foodRepository, never()).delete(any(Food.class));
    }
}
