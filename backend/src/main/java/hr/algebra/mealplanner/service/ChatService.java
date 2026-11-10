package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.client.OpenAiClient;
import hr.algebra.mealplanner.dto.request.ChatRequest;
import hr.algebra.mealplanner.dto.response.ChatResponse;
import hr.algebra.mealplanner.dto.response.DailyLogResponse;
import hr.algebra.mealplanner.dto.response.NutritionResponse;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final UserRepository userRepository;
    private final NutritionCalculator nutritionCalculator;
    private final OpenAiClient openAiClient;
    private final MealEntryService mealEntryService;

    public ChatResponse chat(String email, ChatRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        DailyLogResponse todayLog = mealEntryService.getDailyLog(email, LocalDate.now());
        String systemPrompt = buildSystemPrompt(user, todayLog);
        String reply = openAiClient.chat(systemPrompt, request.message());

        return new ChatResponse(reply);
    }

    private String buildSystemPrompt(User user, DailyLogResponse todayLog) {
        StringBuilder sb = new StringBuilder();
        sb.append("Ti si stručni nutricionistički asistent u aplikaciji za planiranje prehrane. ");
        sb.append("Odgovaraj kratko, jasno i na hrvatskom jeziku. ");
        sb.append("Ne postavljaš medicinske dijagnoze; za zdravstvene probleme uputi korisnika liječniku.\n\n");
        sb.append("Podaci o korisniku:\n");

        if (user.getAge() != null) sb.append("- Dob: ").append(user.getAge()).append(" godina\n");
        if (user.getHeight() != null) sb.append("- Visina: ").append(user.getHeight()).append(" cm\n");
        if (user.getWeight() != null) sb.append("- Težina: ").append(user.getWeight()).append(" kg\n");
        if (user.getGender() != null) sb.append("- Spol: ").append(user.getGender()).append("\n");
        if (user.getActivityLevel() != null) sb.append("- Razina aktivnosti: ").append(user.getActivityLevel()).append("\n");
        if (user.getGoal() != null) sb.append("- Cilj: ").append(user.getGoal()).append("\n");

        NutritionResponse target = null;
        if (isProfileComplete(user)) {
            target = nutritionCalculator.calculate(
                    user.getGender(), user.getAge(), user.getHeight(), user.getWeight(),
                    user.getActivityLevel(), user.getGoal());
            sb.append("- Dnevni cilj: ").append(target.calories()).append(" kcal, ")
                    .append(target.protein()).append(" g bjelančevina, ")
                    .append(target.carbs()).append(" g ugljikohidrata, ")
                    .append(target.fat()).append(" g masti\n");
        }

        sb.append("- Danas pojedeno: ").append(todayLog.totalCalories()).append(" kcal, ")
                .append(todayLog.totalProtein()).append(" g bjelančevina, ")
                .append(todayLog.totalCarbs()).append(" g ugljikohidrata, ")
                .append(todayLog.totalFat()).append(" g masti\n");

        if (target != null) {
            sb.append("- Preostalo do cilja danas: ")
                    .append(target.calories() - todayLog.totalCalories()).append(" kcal, ")
                    .append(target.protein() - todayLog.totalProtein()).append(" g bjelančevina, ")
                    .append(target.carbs() - todayLog.totalCarbs()).append(" g ugljikohidrata, ")
                    .append(target.fat() - todayLog.totalFat()).append(" g masti\n");
        }

        return sb.toString();
    }

    private boolean isProfileComplete(User user) {
        return user.getAge() != null && user.getHeight() != null && user.getWeight() != null
                && user.getGender() != null && user.getActivityLevel() != null && user.getGoal() != null;
    }
}