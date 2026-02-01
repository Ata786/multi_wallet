package com.banking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "wallets")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String currency;
    private String symbol;
    private double balance;
    private String flag;
    private String name;
    @Column(name = "daily_change")
    private double dailyChange;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<Transaction> transactions;

    public Wallet(String currency, String symbol, double balance, String flag, String name, User user) {
        this.currency = currency;
        this.symbol = symbol;
        this.balance = balance;
        this.flag = flag;
        this.name = name;
        this.user = user;
        this.transactions = new java.util.ArrayList<>();
    }
}
