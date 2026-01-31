package com.banking.dto;

import lombok.Data;

@Data
public class CreatePaymentIntentRequest {
    private double amount;
    private String currency;
}
