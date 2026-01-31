package com.banking.dto;

import lombok.Data;

@Data
public class ConvertCurrencyRequest {
    private Long fromWalletId;
    private Long toWalletId;
    private double amount;
}
