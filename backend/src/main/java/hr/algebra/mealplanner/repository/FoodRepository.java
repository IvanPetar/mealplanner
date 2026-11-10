package hr.algebra.mealplanner.repository;

import hr.algebra.mealplanner.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food, Long> {

    Optional<Food> findByBarcode(String barcode);

    List<Food> findByNameContainingIgnoreCase(String name);
}