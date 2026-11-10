package hr.algebra.mealplanner.repository;

import hr.algebra.mealplanner.entity.MealPlan;
import hr.algebra.mealplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByUserOrderByDateDesc(User user);

    Optional<MealPlan> findByUserAndDate(User user, LocalDate date);
}