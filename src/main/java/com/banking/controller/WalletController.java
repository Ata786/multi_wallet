package com.banking.controller;

import com.banking.model.Wallet;
import com.banking.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Wallet>> getUserWallets(@PathVariable Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        return ResponseEntity.ok(wallets);
    }
}
