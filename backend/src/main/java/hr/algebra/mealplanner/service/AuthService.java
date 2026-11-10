package hr.algebra.mealplanner.service;

import hr.algebra.mealplanner.dto.request.LoginRequest;
import hr.algebra.mealplanner.dto.request.RegisterRequest;
import hr.algebra.mealplanner.dto.response.UserResponse;
import hr.algebra.mealplanner.entity.RefreshToken;
import hr.algebra.mealplanner.entity.User;
import hr.algebra.mealplanner.exception.EmailAlreadyExistsException;
import hr.algebra.mealplanner.exception.ResourceNotFoundException;
import hr.algebra.mealplanner.repository.UserRepository;
import hr.algebra.mealplanner.security.JwtService;
import hr.algebra.mealplanner.security.TokenPair;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email je već registriran");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);

        return UserResponse.from(saved);
    }

    public TokenPair login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        return generateTokens(user);
    }

    public TokenPair refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue);
        refreshTokenService.verifyExpiration(refreshToken);

        return generateTokens(refreshToken.getUser());
    }

    public void logout(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue);
        refreshTokenService.deleteByUser(refreshToken.getUser());
    }

    private TokenPair generateTokens(User user) {
        String accessToken = jwtService.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return new TokenPair(accessToken, refreshToken.getToken());
    }
}