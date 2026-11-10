package hr.algebra.mealplanner.repository;

import hr.algebra.mealplanner.entity.MealEntry;
import hr.algebra.mealplanner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealEntryRepository extends JpaRepository<MealEntry, Long> {

    List<MealEntry> findByUserAndDate(User user, LocalDate date);

    List<MealEntry> findByUserOrderByDateDesc(User user);
}