package com.example.feedbackapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final FeedbackRepository feedbackRepository;
    private final AuthService authService;

    @Autowired
    public DataInitializer(FeedbackRepository feedbackRepository, AuthService authService) {
        this.feedbackRepository = feedbackRepository;
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        // Seed demo accounts
        authService.seedUserIfMissing(
                "Alex Student",
                "student@example.com",
                "Student123",
                "STUDENT"
        );

        authService.seedUserIfMissing(
                "Prof. Davis",
                "trainer@example.com",
                "Trainer123",
                "TRAINER"
        );

        authService.seedUserIfMissing(
                "Sahasra",
                "sahasra@gmail.com",
                "Student123",
                "STUDENT"
        );

        // Seed initial course feedback records if empty
        if (feedbackRepository.count() == 0) {
            feedbackRepository.save(new Feedback(
                    "Sophia Martinez",
                    "CS101: Introduction to Computer Science",
                    5,
                    "Outstanding introductory course! Engaging lectures and practical coding assignments."
            ));
            feedbackRepository.save(new Feedback(
                    "Liam Chen",
                    "MATH205: Linear Algebra",
                    4,
                    "Thorough explanations of eigenvalues and vector spaces. Great problem sets."
            ));
            feedbackRepository.save(new Feedback(
                    "Emma Watson",
                    "CS350: Distributed Cloud Architectures",
                    5,
                    "Phenomenal course on consensus protocols, microservices, and high-availability patterns."
            ));
            feedbackRepository.save(new Feedback(
                    "Marcus Rivera",
                    "ENG102: Technical Writing & Communication",
                    3,
                    "Good material on research papers and documentation, though pacing could be improved."
            ));
        }
    }
}
