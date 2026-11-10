package hr.algebra.mealplanner.repository;

import hr.algebra.mealplanner.entity.Allergen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AllergenRepository extends JpaRepository<Allergen, Long> {

    Optional<Allergen> findByName(String name);
}