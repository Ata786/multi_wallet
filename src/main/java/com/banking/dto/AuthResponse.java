package com.banking.dto;

import com.banking.model.User;
import lombok.Data;

@Data
public class AuthResponse {
    private String token; // For future JWT (or just session ID for now)
    private User user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }
}
