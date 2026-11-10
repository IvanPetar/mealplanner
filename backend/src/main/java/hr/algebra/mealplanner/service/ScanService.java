package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.client.OpenFoodFactsClient;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.dto.response.FoodResponse;
import hr.algebra.mealplanner.dto.response.ScanResponse;
import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.entity.Food;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.FoodRepository;
import hr.algebra.mealplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanService {

    private final FoodRepository foodRepository;
    private final UserRepository userRepository;
    private final OpenFoodFactsClient openFoodFactsClient;

    @Transactional
    public ScanResponse scan(String email, String barcode) {
        Food food = getOrFetchFood(barcode);

        // Ako namirnica (npr. već spremljena u bazi) nema alergene,
        // razriješi ih s OpenFoodFacts po barkodu radi detekcije.
        if (food.getAllergens() == null || food.getAllergens().isEmpty()) {
            openFoodFactsClient.findByBarcode(barcode)
                    .ifPresent(off -> food.setAllergens(off.getAllergens()));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        Set<Long> userAllergenIds = user.getAllergens().stream()
                .map(Allergen::getId)
                .collect(Collectors.toSet());

        List<AllergenResponse> warnings = food.getAllergens().stream()
                .filter(allergen -> userAllergenIds.contains(allergen.getId()))
                .map(AllergenResponse::from)
                .toList();

        return new ScanResponse(FoodResponse.from(food), warnings);
    }

    private Food getOrFetchFood(String barcode) {
        // Skeniranje samo prikazuje proizvod (ne sprema automatski);
        // korisnik ga eksplicitno dodaje u bazu preko POST /api/foods.
        return foodRepository.findByBarcode(barcode)
                .orElseGet(() -> openFoodFactsClient.findByBarcode(barcode)
                        .orElseThrow(() -> new ResourceNotFoundException("Proizvod s barkodom nije pronađen: " + barcode)));
    }
}