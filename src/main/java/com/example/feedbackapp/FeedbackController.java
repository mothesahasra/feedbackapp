package com.example.feedbackapp;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    private UserDto getAuthenticatedUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            return (UserDto) session.getAttribute(AuthController.SESSION_USER_KEY);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createFeedback(@Valid @RequestBody Feedback feedback, HttpServletRequest request) {
        UserDto currentUser = getAuthenticatedUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Authentication required to submit feedback."));
        }

        if ("TRAINER".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("message", "Trainers are not permitted to submit student feedback."));
        }

        Feedback saved = feedbackService.saveFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<?> getFeedback(
            @RequestParam(name = "rating", required = false) Integer rating,
            HttpServletRequest request) {
        UserDto currentUser = getAuthenticatedUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Authentication required."));
        }

        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Rating filter must be an integer between 1 and 5.");
        }
        List<Feedback> feedbackList = feedbackService.getAllFeedback(rating);
        return ResponseEntity.ok(feedbackList);
    }

    @GetMapping("/average")
    public ResponseEntity<?> getAverageRating(HttpServletRequest request) {
        UserDto currentUser = getAuthenticatedUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Authentication required."));
        }

        double avg = feedbackService.getAverageRating();
        return ResponseEntity.ok(Collections.singletonMap("averageRating", avg));
    }

    @GetMapping("/count")
    public ResponseEntity<?> getTotalCount(HttpServletRequest request) {
        UserDto currentUser = getAuthenticatedUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Authentication required."));
        }

        long count = feedbackService.getTotalCount();
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }
}
