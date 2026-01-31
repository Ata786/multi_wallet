package com.banking.controller;

import com.banking.model.Transaction;
import com.banking.model.Wallet;
import com.banking.repository.TransactionRepository;
import com.banking.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<List<Transaction>> getWalletTransactions(@PathVariable Long walletId) {
        return ResponseEntity.ok(transactionRepository.findByWallet_IdOrderByTimestampDesc(walletId));
    }

    @GetMapping("/wallet/{walletId}/stats")
    public ResponseEntity<Map<String, Object>> getWalletStats(@PathVariable Long walletId) {
        List<Transaction> transactions = transactionRepository.findByWallet_IdOrderByTimestampDesc(walletId);

        double totalReceived = transactions.stream()
                .filter(t -> "DEPOSIT".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalSent = transactions.stream()
                .filter(t -> "WITHDRAWAL".equals(t.getType()) || "TRANSFER".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalReceived", totalReceived);
        stats.put("totalSent", totalSent);
        stats.put("transactionCount", transactions.size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        List<Transaction> allTransactions = wallets.stream()
                .flatMap(w -> transactionRepository.findByWallet_IdOrderByTimestampDesc(w.getId()).stream())
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(allTransactions);
    }
}
