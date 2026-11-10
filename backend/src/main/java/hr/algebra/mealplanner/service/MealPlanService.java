package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.response.MealPlanItemResponse;
import hr.algebra.mealplanner.dto.response.MealPlanResponse;
import hr.algebra.mealplanner.dto.response.NutritionResponse;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.enums.FoodCategory;
import hr.algebra.mealplanner.enums.MealType;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.FoodRepository;
import hr.algebra.mealplanner.repository.MealPlanRepository;
import hr.algebra.mealplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hr.algebra.mealplanner.dto.request.MealPlanItemRequest;
import hr.algebra.mealplanner.dto.request.SaveMealPlanRequest;
import hr.algebra.mealplanner.entity.MealPlan;
import hr.algebra.mealplanner.entity.MealPlanItem;
import hr.algebra.mealplanner.entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final UserService userService;
    private final FoodRepository foodRepository;
    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;

    private static final Map<MealType, Double> MEAL_DISTRIBUTION = Map.of(
            MealType.BREAKFAST, 0.25,
            MealType.LUNCH, 0.35,
            MealType.DINNER, 0.30,
            MealType.SNACK, 0.10
    );

    private static final List<MealType> MEAL_ORDER = List.of(
            MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK
    );

    private record Component(FoodCategory category, double fraction) {
    }

    // Sastav svakog obroka po kategorijama (udio kalorija tog obroka)
    private static final Map<MealType, List<Component>> RECIPES = Map.of(
            MealType.BREAKFAST, List.of(
                    new Component(FoodCategory.DAIRY, 0.4),
                    new Component(FoodCategory.CARBS, 0.4),
                    new Component(FoodCategory.FRUIT, 0.2)),
            MealType.LUNCH, List.of(
                    new Component(FoodCategory.PROTEIN, 0.4),
                    new Component(FoodCategory.CARBS, 0.4),
                    new Component(FoodCategory.VEGETABLE, 0.2)),
            MealType.DINNER, List.of(
                    new Component(FoodCategory.PROTEIN, 0.4),
                    new Component(FoodCategory.CARBS, 0.35),
                    new Component(FoodCategory.VEGETABLE, 0.25)),
            MealType.SNACK, List.of(
                    new Component(FoodCategory.FRUIT, 0.5),
                    new Component(FoodCategory.DAIRY, 0.5))
    );

    public MealPlanResponse generate(String email, LocalDate date) {
        NutritionResponse target = userService.getNutrition(email);

        List<Food> foods = foodRepository.findAll();
        if (foods.isEmpty()) {
            throw new ResourceNotFoundException("Nema dostupnih namirnica za generiranje plana");
        }

        // Grupiraj namirnice po kategoriji (preskoči one s 0 kcal da izbjegnemo dijeljenje s nulom)
        Map<FoodCategory, List<Food>> byCategory = foods.stream()
                .filter(f -> f.getCaloriesPer100g() != null && f.getCaloriesPer100g() > 0)
                .collect(Collectors.groupingBy(f ->
                        f.getCategory() != null ? f.getCategory() : FoodCategory.OTHER));

        Random random = new Random();
        Set<Long> usedFoodIds = new HashSet<>();
        List<MealPlanItemResponse> items = new ArrayList<>();

        for (MealType mealType : MEAL_ORDER) {
            double mealCalories = target.calories() * MEAL_DISTRIBUTION.get(mealType);
            for (Component comp : RECIPES.get(mealType)) {
                Food food = pickFood(byCategory, comp.category(), usedFoodIds, random);
                if (food == null) {
                    continue;
                }
                double compCalories = mealCalories * comp.fraction();
                double grams = compCalories / food.getCaloriesPer100g() * 100.0;
                items.add(buildItem(mealType, food, grams));
            }
        }

        return buildPlan(date, target.calories(), items);
    }

    private Food pickFood(Map<FoodCategory, List<Food>> byCategory, FoodCategory category,
                          Set<Long> usedFoodIds, Random random) {
        List<Food> pool = byCategory.get(category);
        if (pool == null || pool.isEmpty()) {
            pool = byCategory.get(FoodCategory.OTHER);
        }
        if (pool == null || pool.isEmpty()) {
            return null;
        }

        // Prvo probaj namirnice koje još nisu iskorištene u ovom planu (izbjegavaj duplikate)
        List<Food> unused = pool.stream()
                .filter(f -> !usedFoodIds.contains(f.getId()))
                .toList();
        List<Food> choices = unused.isEmpty() ? pool : unused;

        Food chosen = choices.get(random.nextInt(choices.size()));
        usedFoodIds.add(chosen.getId());
        return chosen;
    }

    private MealPlanItemResponse buildItem(MealType mealType, Food food, double grams) {
        double factor = grams / 100.0;
        return new MealPlanItemResponse(
                mealType,
                food.getId(),
                food.getName(),
                (int) Math.round(grams),
                (int) Math.round(food.getCaloriesPer100g() * factor),
                (int) Math.round(food.getProteinPer100g() * factor),
                (int) Math.round(food.getCarbsPer100g() * factor),
                (int) Math.round(food.getFatPer100g() * factor)
        );
    }

    private MealPlanResponse buildPlan(LocalDate date, int targetCalories, List<MealPlanItemResponse> items) {
        int totalCalories = items.stream().mapToInt(MealPlanItemResponse::calories).sum();
        int totalProtein = items.stream().mapToInt(MealPlanItemResponse::protein).sum();
        int totalCarbs = items.stream().mapToInt(MealPlanItemResponse::carbs).sum();
        int totalFat = items.stream().mapToInt(MealPlanItemResponse::fat).sum();

        return new MealPlanResponse(null, date, targetCalories, totalCalories,
                totalProtein, totalCarbs, totalFat, items);
    }

    @Transactional
    public MealPlanResponse savePlan(String email, SaveMealPlanRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        MealPlan plan = new MealPlan();
        plan.setUser(user);
        plan.setDate(request.date());
        plan.setTargetCalories(request.targetCalories());

        for (MealPlanItemRequest itemRequest : request.items()) {
            Food food = foodRepository.findById(itemRequest.foodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Namirnica nije pronađena: " + itemRequest.foodId()));

            MealPlanItem item = new MealPlanItem();
            item.setFood(food);
            item.setMealType(itemRequest.mealType());
            item.setQuantityGrams(itemRequest.quantityGrams());

            plan.addItem(item);
        }

        return MealPlanResponse.from(mealPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public List<MealPlanResponse> getUserPlans(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        return mealPlanRepository.findByUserOrderByDateDesc(user).stream()
                .map(MealPlanResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MealPlanResponse getPlan(String email, Long id) {
        return MealPlanResponse.from(findOwnedPlan(email, id));
    }

    @Transactional
    public void deletePlan(String email, Long id) {
        mealPlanRepository.delete(findOwnedPlan(email, id));
    }

    private MealPlan findOwnedPlan(String email, Long id) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan nije pronađen: " + id));
        if (!plan.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Plan nije pronađen: " + id);
        }
        return plan;
    }
}