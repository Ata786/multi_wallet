package com.banking.dto;

import lombok.Data;

@Data
public class CreateWalletRequest {
    private Long userId;
    private String currency;
    private double initialDeposit;
}
