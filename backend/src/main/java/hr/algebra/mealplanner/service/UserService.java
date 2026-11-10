package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.response.UserResponse;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hr.algebra.mealplanner.dto.request.UpdateProfileRequest;
import hr.algebra.mealplanner.dto.response.NutritionResponse;
import hr.algebra.mealplanner.exception.IncompleteProfileException;
import hr.algebra.mealplanner.dto.request.UpdateAllergensRequest;
import hr.algebra.mealplanner.dto.response.AllergenResponse;
import hr.algebra.mealplanner.entity.Allergen;
import hr.algebra.mealplanner.repository.AllergenRepository;
import hr.algebra.mealplanner.dto.request.ChangePasswordRequest;
import hr.algebra.mealplanner.dto.request.ChangeEmailRequest;
import hr.algebra.mealplanner.exception.EmailAlreadyExistsException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NutritionCalculator nutritionCalculator;
    private final AllergenRepository allergenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        return UserResponse.from(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        user.setAge(request.age());
        user.setHeight(request.height());
        user.setWeight(request.weight());
        user.setGender(request.gender());
        user.setActivityLevel(request.activityLevel());
        user.setGoal(request.goal());

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    public NutritionResponse getNutrition(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (user.getAge() == null || user.getHeight() == null || user.getWeight() == null
                || user.getGender() == null || user.getActivityLevel() == null || user.getGoal() == null) {
            throw new IncompleteProfileException("Profil nije potpun. Popunite profil prije izračuna.");
        }

        return nutritionCalculator.calculate(
                user.getGender(), user.getAge(), user.getHeight(), user.getWeight(),
                user.getActivityLevel(), user.getGoal());
    }

    @Transactional(readOnly = true)
    public List<AllergenResponse> getUserAllergens(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));
        return user.getAllergens().stream().map(AllergenResponse::from).toList();
    }

    @Transactional
    public List<AllergenResponse> updateAllergens(String email, UpdateAllergensRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        Set<Allergen> allergens = new HashSet<>(allergenRepository.findAllById(request.allergenIds()));
        user.setAllergens(allergens);
        userRepository.save(user);

        return allergens.stream().map(AllergenResponse::from).toList();
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Trenutna lozinka nije ispravna");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponse changeEmail(String email, ChangeEmailRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Lozinka nije ispravna");
        }
        if (userRepository.existsByEmail(request.newEmail())) {
            throw new EmailAlreadyExistsException("Email je već zauzet");
        }

        user.setEmail(request.newEmail());
        return UserResponse.from(userRepository.save(user));
    }
}