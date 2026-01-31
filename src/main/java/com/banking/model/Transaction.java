package com.banking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    @JsonIgnore
    private Wallet wallet;

    public Long getWalletId() {
        return wallet != null ? wallet.getId() : null;
    }

    public String getWalletCurrency() {
        return wallet != null ? wallet.getCurrency() : null;
    }

    private String type; // DEPOSIT, WITHDRAWAL, CONVERSION
    private double amount;
    private String description;
    private LocalDateTime timestamp;
    private String status; // SUCCESS, PENDING, FAILED
    private String paymentIntentId; // Stripe Payment Intent ID

    public Transaction(Wallet wallet, String type, double amount, String description, String status,
            String paymentIntentId) {
        this.wallet = wallet;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.paymentIntentId = paymentIntentId;
    }
}
