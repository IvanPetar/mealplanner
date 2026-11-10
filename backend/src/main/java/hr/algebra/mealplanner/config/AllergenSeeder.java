package hr.algebra.mealplanner.config;

import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.repository.AllergenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AllergenSeeder implements CommandLineRunner {

    private final AllergenRepository allergenRepository;

    // 14 glavnih EU alergena (nazivi moraju odgovarati mapiranju u OpenFoodFactsClient)
    private static final List<String> ALLERGENS = List.of(
            "Gluten", "Mlijeko", "Jaja", "Orašasti plodovi", "Kikiriki", "Soja",
            "Riba", "Rakovi", "Mekušci", "Celer", "Senf", "Sezam", "Sulfiti", "Lupina"
    );

    @Override
    public void run(String... args) {
        for (String name : ALLERGENS) {
            if (allergenRepository.findByName(name).isEmpty()) {
                Allergen allergen = new Allergen();
                allergen.setName(name);
                allergenRepository.save(allergen);
            }
        }
    }
}
