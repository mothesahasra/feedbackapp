package com.example.feedbackapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto authenticate(String email, String plainPassword, String requestedRole) {
        if (email == null || plainPassword == null || requestedRole == null) {
            throw new IllegalArgumentException("Email, password, and role are all required.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedRole = requestedRole.trim().toUpperCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found for " + normalizedEmail + ". Please sign up below to create your account."));

        if (!passwordEncoder.matches(plainPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password for " + normalizedEmail + ". Please check your password or try again.");
        }

        if (!user.getRole().equalsIgnoreCase(normalizedRole)) {
            throw new IllegalArgumentException("Account exists, but is registered as a " + user.getRole().toLowerCase() + ". Please switch role selection to " + user.getRole().toLowerCase() + ".");
        }

        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public UserDto register(String name, String email, String plainPassword, String role) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (plainPassword == null || plainPassword.length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long.");
        }
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("Role selection is required.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String normalizedRole = role.trim().toUpperCase();

        if (!"STUDENT".equals(normalizedRole) && !"TRAINER".equals(normalizedRole)) {
            throw new IllegalArgumentException("Role must be either STUDENT or TRAINER.");
        }

        String passwordHash = passwordEncoder.encode(plainPassword);
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user != null) {
            user.setName(name.trim());
            user.setPasswordHash(passwordHash);
            user.setRole(normalizedRole);
            User saved = userRepository.save(user);
            return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
        }

        User newUser = new User(name.trim(), normalizedEmail, passwordHash, normalizedRole);
        User saved = userRepository.save(newUser);

        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    public void seedUserIfMissing(String name, String email, String plainPassword, String role) {
        String normalizedEmail = email.trim().toLowerCase();
        if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            String hash = passwordEncoder.encode(plainPassword);
            User user = new User(name, normalizedEmail, hash, role.toUpperCase());
            userRepository.save(user);
        }
    }
}
