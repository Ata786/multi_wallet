package com.banking.dto;

import lombok.Data;

@Data
public class TransferRequest {
    private Long senderWalletId;
    private String recipientEmail;
    private double amount;
    private String note;
}
