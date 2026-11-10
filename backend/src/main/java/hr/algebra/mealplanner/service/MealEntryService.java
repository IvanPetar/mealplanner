package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.CreateMealEntryRequest;
import hr.algebra.mealplanner.dto.response.DailyLogResponse;
import hr.algebra.mealplanner.dto.response.MealEntryResponse;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.entity.MealEntry;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.FoodRepository;
import hr.algebra.mealplanner.repository.MealEntryRepository;
import hr.algebra.mealplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealEntryService {

    private final MealEntryRepository mealEntryRepository;
    private final UserRepository userRepository;
    private final FoodRepository foodRepository;

    @Transactional
    public MealEntryResponse logMeal(String email, CreateMealEntryRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));
        Food food = foodRepository.findById(request.foodId())
                .orElseThrow(() -> new ResourceNotFoundException("Namirnica nije pronađena: " + request.foodId()));

        MealEntry entry = new MealEntry();
        entry.setUser(user);
        entry.setFood(food);
        entry.setQuantityGrams(request.quantityGrams());
        entry.setMealType(request.mealType());
        entry.setDate(request.date());

        return MealEntryResponse.from(mealEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public DailyLogResponse getDailyLog(String email, LocalDate date) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        List<MealEntryResponse> entries = mealEntryRepository.findByUserAndDate(user, date).stream()
                .map(MealEntryResponse::from)
                .toList();

        int totalCalories = entries.stream().mapToInt(MealEntryResponse::calories).sum();
        int totalProtein = entries.stream().mapToInt(MealEntryResponse::protein).sum();
        int totalCarbs = entries.stream().mapToInt(MealEntryResponse::carbs).sum();
        int totalFat = entries.stream().mapToInt(MealEntryResponse::fat).sum();

        return new DailyLogResponse(date, totalCalories, totalProtein, totalCarbs, totalFat, entries);
    }

    @Transactional
    public void deleteEntry(String email, Long id) {
        MealEntry entry = mealEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zapis nije pronađen: " + id));

        if (!entry.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Zapis nije pronađen: " + id);
        }

        mealEntryRepository.delete(entry);
    }
}