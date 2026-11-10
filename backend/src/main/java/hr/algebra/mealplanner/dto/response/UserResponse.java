package hr.algebra.mealplanner.dto.response;

import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.enums.ActivityLevel;
import hr.algebra.mealplanner.enums.Gender;
import hr.algebra.mealplanner.enums.Goal;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        Integer age,
        Integer height,
        Double weight,
        Gender gender,
        ActivityLevel activityLevel,
        Goal goal,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getAge(),
                user.getHeight(),
                user.getWeight(),
                user.getGender(),
                user.getActivityLevel(),
                user.getGoal(),
                user.getCreatedAt()
        );
    }
}