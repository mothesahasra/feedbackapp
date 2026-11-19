package com.example.feedbackapp;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student name is required and cannot be blank")
    @Column(nullable = false)
    private String studentName;

    @NotBlank(message = "Course name is required and cannot be blank")
    @Column(nullable = false)
    private String courseName;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be an integer between 1 and 5")
    @Max(value = 5, message = "Rating must be an integer between 1 and 5")
    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String comments;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    public Feedback() {
    }

    public Feedback(String studentName, String courseName, Integer rating, String comments) {
        this.studentName = studentName;
        this.courseName = courseName;
        this.rating = rating;
        this.comments = comments;
    }

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName != null ? studentName.trim() : null;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName != null ? courseName.trim() : null;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments != null ? comments.trim() : null;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
