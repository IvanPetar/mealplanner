package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.RegisterRequest;
import hr.algebra.mealplanner.dto.response.UserResponse;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.EmailAlreadyExistsException;
import hr.algebra.mealplanner.repository.UserRepository;
import hr.algebra.mealplanner.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private RefreshTokenService refreshTokenService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        authenticationManager = mock(AuthenticationManager.class);
        jwtService = mock(JwtService.class);
        refreshTokenService = mock(RefreshTokenService.class);
        authService = new AuthService(userRepository, passwordEncoder,
                authenticationManager, jwtService, refreshTokenService);
    }

    @Test
    void register_existingEmail_throwsException() {
        when(userRepository.existsByEmail("test@test.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("test@test.com", "password123");

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_newEmail_encodesPasswordAndSaves() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("HASHED_PASSWORD");

        User saved = new User();
        saved.setId(1L);
        saved.setEmail("new@test.com");
        saved.setPassword("HASHED_PASSWORD");
        saved.setCreatedAt(LocalDateTime.now());
        when(userRepository.save(any(User.class))).thenReturn(saved);

        RegisterRequest request = new RegisterRequest("new@test.com", "password123");
        UserResponse result = authService.register(request);

        assertEquals("new@test.com", result.email());
        assertEquals(1L, result.id());
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }
}
