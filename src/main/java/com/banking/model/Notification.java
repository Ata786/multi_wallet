package com.banking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private String type; // TRANSFER_RECEIVED, TRANSFER_SENT, CONVERSION, DEPOSIT
    private String title;
    private String message;
    private double amount;
    private String currency;
    private boolean isRead;
    private LocalDateTime createdAt;

    public Notification(User user, String type, String title, String message, double amount, String currency) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.amount = amount;
        this.currency = currency;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}
