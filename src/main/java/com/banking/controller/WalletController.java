package com.banking.controller;

import com.banking.dto.CreateWalletRequest;
import com.banking.model.Wallet;
import com.banking.repository.WalletRepository;
import com.banking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Wallet>> getUserWallets(@PathVariable Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        return ResponseEntity.ok(wallets);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createWallet(@RequestBody CreateWalletRequest request) {
        try {
            Wallet wallet = userService.createWallet(request.getUserId(), request.getCurrency(),
                    request.getInitialDeposit());
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
