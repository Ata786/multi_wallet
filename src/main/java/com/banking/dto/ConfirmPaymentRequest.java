package com.banking.dto;

import lombok.Data;

@Data
public class ConfirmPaymentRequest {
    private String paymentIntentId;
    private Long walletId;
}
