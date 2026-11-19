package com.example.feedbackapp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class FeedbackappApplicationTests {

    private MockMvc mockMvc;

    @Autowired
    private FeedbackController feedbackController;

    @Autowired
    private AuthController authController;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AuthService authService;

    private MockHttpSession studentSession;
    private MockHttpSession trainerSession;

    @BeforeEach
    void setUp() {
        feedbackRepository.deleteAll();
        this.mockMvc = MockMvcBuilders.standaloneSetup(feedbackController, authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        authService.seedUserIfMissing("Alex Student", "student@example.com", "Student123", "STUDENT");
        authService.seedUserIfMissing("Prof. Davis", "trainer@example.com", "Trainer123", "TRAINER");

        studentSession = new MockHttpSession();
        studentSession.setAttribute(AuthController.SESSION_USER_KEY, new UserDto(1L, "Alex Student", "student@example.com", "STUDENT"));

        trainerSession = new MockHttpSession();
        trainerSession.setAttribute(AuthController.SESSION_USER_KEY, new UserDto(2L, "Prof. Davis", "trainer@example.com", "TRAINER"));
    }

    @Test
    void testAuthLoginSuccessAndRoleMismatch() throws Exception {
        // Valid student login
        String studentLogin = """
                {
                    "email": "student@example.com",
                    "password": "Student123",
                    "role": "STUDENT"
                }
                """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentLogin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("student@example.com")))
                .andExpect(jsonPath("$.role", is("STUDENT")));

        // Role mismatch: student selects TRAINER
        String studentAsTrainer = """
                {
                    "email": "student@example.com",
                    "password": "Student123",
                    "role": "TRAINER"
                }
                """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(studentAsTrainer))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("registered as a student")));

        // Invalid password
        String wrongPassword = """
                {
                    "email": "student@example.com",
                    "password": "WrongPassword",
                    "role": "STUDENT"
                }
                """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(wrongPassword))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Incorrect password")));

        // Test Sign Up / Registration
        String signupPayload = """
                {
                    "name": "Sahasra User",
                    "email": "sahasra@gmail.com",
                    "password": "Password123",
                    "role": "STUDENT"
                }
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Sahasra User")))
                .andExpect(jsonPath("$.email", is("sahasra@gmail.com")))
                .andExpect(jsonPath("$.role", is("STUDENT")));
    }

    @Test
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/feedback"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentName\":\"A\",\"courseName\":\"B\",\"rating\":5}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testTrainerCannotSubmitFeedback() throws Exception {
        String jsonPayload = """
                {
                    "studentName": "Trainer Trying To Post",
                    "courseName": "Cloud 101",
                    "rating": 5,
                    "comments": "Testing trainer restriction"
                }
                """;

        mockMvc.perform(post("/api/feedback")
                        .session(trainerSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Trainers are not permitted")));
    }

    @Test
    void testStudentCanSubmitAndRetrieveFeedback() throws Exception {
        String jsonPayload = """
                {
                    "studentName": "Alice Johnson",
                    "courseName": "Full Stack Web Development",
                    "rating": 5,
                    "comments": "Exceptional course with hands-on projects!"
                }
                """;

        mockMvc.perform(post("/api/feedback")
                        .session(studentSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.studentName", is("Alice Johnson")))
                .andExpect(jsonPath("$.rating", is(5)));

        // Both student and trainer can read feedback
        mockMvc.perform(get("/api/feedback").session(studentSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/feedback").session(trainerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void testFeedbackFilteringAverageAndCountWithAuth() throws Exception {
        Feedback f1 = new Feedback("Student A", "Math 101", 5, "Great");
        Feedback f2 = new Feedback("Student B", "Math 101", 4, "Good");
        Feedback f3 = new Feedback("Student C", "History 201", 3, "Average");
        feedbackRepository.save(f1);
        feedbackRepository.save(f2);
        feedbackRepository.save(f3);

        mockMvc.perform(get("/api/feedback/count").session(trainerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(3)));

        mockMvc.perform(get("/api/feedback/average").session(trainerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating", is(4.0)));

        mockMvc.perform(get("/api/feedback").session(studentSession).param("rating", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].studentName", is("Student A")));
    }
}
