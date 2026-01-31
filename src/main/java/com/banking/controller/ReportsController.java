package com.banking.controller;

import com.banking.model.Transaction;
import com.banking.model.Wallet;
import com.banking.repository.TransactionRepository;
import com.banking.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getUserSummary(@PathVariable Long userId) {
        List<Wallet> wallets = walletRepository.findByUserId(userId);

        // Get all transactions
        List<Transaction> allTransactions = wallets.stream()
                .flatMap(w -> transactionRepository.findByWallet_IdOrderByTimestampDesc(w.getId()).stream())
                .collect(Collectors.toList());

        // Calculate totals
        double totalBalance = wallets.stream().mapToDouble(Wallet::getBalance).sum();

        double totalReceived = allTransactions.stream()
                .filter(t -> "DEPOSIT".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalSent = allTransactions.stream()
                .filter(t -> "TRANSFER".equals(t.getType()) || "WITHDRAWAL".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double totalConverted = allTransactions.stream()
                .filter(t -> "CONVERSION".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        // Wallet breakdown
        List<Map<String, Object>> walletBreakdown = wallets.stream()
                .map(w -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("id", w.getId());
                    info.put("currency", w.getCurrency());
                    info.put("symbol", w.getSymbol());
                    info.put("balance", w.getBalance());
                    info.put("flag", w.getFlag());
                    return info;
                })
                .collect(Collectors.toList());

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBalance", totalBalance);
        summary.put("totalReceived", totalReceived);
        summary.put("totalSent", totalSent);
        summary.put("totalConverted", totalConverted);
        summary.put("totalTransactions", allTransactions.size());
        summary.put("walletCount", wallets.size());
        summary.put("wallets", walletBreakdown);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}/monthly")
    public ResponseEntity<?> getMonthlyReport(
            @PathVariable Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        List<Wallet> wallets = walletRepository.findByUserId(userId);

        // Default to current month
        LocalDateTime now = LocalDateTime.now();
        int targetYear = year != null ? year : now.getYear();
        int targetMonth = month != null ? month : now.getMonthValue();

        LocalDateTime startOfMonth = LocalDateTime.of(targetYear, targetMonth, 1, 0, 0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);

        // Get transactions for the month
        List<Transaction> monthTransactions = wallets.stream()
                .flatMap(w -> transactionRepository.findByWallet_IdOrderByTimestampDesc(w.getId()).stream())
                .filter(t -> !t.getTimestamp().isBefore(startOfMonth) && !t.getTimestamp().isAfter(endOfMonth))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());

        double monthlyReceived = monthTransactions.stream()
                .filter(t -> "DEPOSIT".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double monthlySent = monthTransactions.stream()
                .filter(t -> "TRANSFER".equals(t.getType()) || "WITHDRAWAL".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        // Group by day for chart data
        Map<Integer, Double> dailyIn = new HashMap<>();
        Map<Integer, Double> dailyOut = new HashMap<>();

        for (Transaction t : monthTransactions) {
            int day = t.getTimestamp().getDayOfMonth();
            if ("DEPOSIT".equals(t.getType())) {
                dailyIn.merge(day, t.getAmount(), Double::sum);
            } else if ("TRANSFER".equals(t.getType()) || "WITHDRAWAL".equals(t.getType())) {
                dailyOut.merge(day, t.getAmount(), Double::sum);
            }
        }

        // Transaction type breakdown
        Map<String, Long> typeBreakdown = monthTransactions.stream()
                .collect(Collectors.groupingBy(Transaction::getType, Collectors.counting()));

        Map<String, Object> report = new HashMap<>();
        report.put("year", targetYear);
        report.put("month", targetMonth);
        report.put("monthName", startOfMonth.getMonth().toString());
        report.put("totalReceived", monthlyReceived);
        report.put("totalSent", monthlySent);
        report.put("netFlow", monthlyReceived - monthlySent);
        report.put("transactionCount", monthTransactions.size());
        report.put("dailyInflow", dailyIn);
        report.put("dailyOutflow", dailyOut);
        report.put("typeBreakdown", typeBreakdown);

        return ResponseEntity.ok(report);
    }

    @GetMapping("/user/{userId}/transactions/export")
    public ResponseEntity<?> exportTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<Wallet> wallets = walletRepository.findByUserId(userId);

        List<Transaction> transactions = wallets.stream()
                .flatMap(w -> transactionRepository.findByWallet_IdOrderByTimestampDesc(w.getId()).stream())
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());

        // Filter by date if provided
        if (startDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            transactions = transactions.stream()
                    .filter(t -> !t.getTimestamp().isBefore(start))
                    .collect(Collectors.toList());
        }

        if (endDate != null) {
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            transactions = transactions.stream()
                    .filter(t -> !t.getTimestamp().isAfter(end))
                    .collect(Collectors.toList());
        }

        // Format transactions for export
        List<Map<String, Object>> exportData = transactions.stream()
                .map(t -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", t.getId());
                    item.put("type", t.getType());
                    item.put("amount", t.getAmount());
                    item.put("currency", t.getWalletCurrency());
                    item.put("description", t.getDescription());
                    item.put("status", t.getStatus());
                    item.put("date", t.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(exportData);
    }
}
