package com.example.feedbackapp;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String SESSION_USER_KEY = "CURRENT_USER";

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        UserDto userDto = authService.authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                loginRequest.getRole()
        );

        // Invalidate old session to prevent fixation and set new session attribute
        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_USER_KEY, userDto);

        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        UserDto userDto = authService.register(
                registerRequest.getName(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getRole()
        );

        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_USER_KEY, userDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

    @PostMapping("/signup")
    public ResponseEntity<UserDto> signup(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        return register(registerRequest, request);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            UserDto userDto = (UserDto) session.getAttribute(SESSION_USER_KEY);
            if (userDto != null) {
                return ResponseEntity.ok(userDto);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Not authenticated"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Collections.singletonMap("message", "Logged out successfully"));
    }
}
