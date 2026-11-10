package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.CreateAllergenRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.repository.AllergenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AllergenService {

    private final AllergenRepository allergenRepository;

    public AllergenResponse create(CreateAllergenRequest request) {
        Allergen allergen = new Allergen();
        allergen.setName(request.name());
        return AllergenResponse.from(allergenRepository.save(allergen));
    }

    public List<AllergenResponse> getAll() {
        return allergenRepository.findAll().stream()
                .map(AllergenResponse::from)
                .toList();
    }
}