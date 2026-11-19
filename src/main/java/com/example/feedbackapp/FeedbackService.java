package com.example.feedbackapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        if (feedback.getSubmittedAt() == null) {
            feedback.setSubmittedAt(LocalDateTime.now());
        }
        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedback(Integer rating) {
        if (rating != null) {
            return feedbackRepository.findByRatingOrderBySubmittedAtDesc(rating);
        }
        return feedbackRepository.findAllByOrderBySubmittedAtDesc();
    }

    @Transactional(readOnly = true)
    public double getAverageRating() {
        Double avg = feedbackRepository.getAverageRating();
        if (avg == null || avg.isNaN()) {
            return 0.0;
        }
        return BigDecimal.valueOf(avg)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    @Transactional(readOnly = true)
    public long getTotalCount() {
        return feedbackRepository.count();
    }
}
