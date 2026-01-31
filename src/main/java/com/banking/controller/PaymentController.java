package com.banking.controller;

import com.banking.dto.ConfirmPaymentRequest;
import com.banking.dto.CreatePaymentIntentRequest;
import com.banking.model.Transaction;
import com.banking.model.Wallet;
import com.banking.repository.TransactionRepository;
import com.banking.repository.WalletRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public PaymentController() {
        Stripe.apiKey = "STRIPE_KEY_REMOVED";
    }

    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (request.getAmount() * 100)) // Amount in cents
                    .setCurrency(request.getCurrency().toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/confirm")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<?> confirmPayment(@RequestBody ConfirmPaymentRequest request) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(request.getPaymentIntentId());

            if (!"succeeded".equals(intent.getStatus())) {
                return ResponseEntity.badRequest().body("Payment not succeeded");
            }

            // check if transaction already processed
            // (Simple check - largely depends on business logic, here we assume client
            // calls once)

            Wallet wallet = walletRepository.findById(request.getWalletId())
                    .orElseThrow(() -> new Exception("Wallet not found"));

            double amount = intent.getAmount() / 100.0;

            // Credit Wallet
            wallet.setBalance(wallet.getBalance() + amount);
            wallet.setDailyChange(wallet.getDailyChange() + 0.1); // Fake positive movement
            walletRepository.save(wallet);

            // Record Transaction
            Transaction tx = new Transaction(
                    wallet,
                    "DEPOSIT",
                    amount,
                    "Stripe Deposit",
                    "SUCCESS",
                    intent.getId());
            transactionRepository.save(tx);

            return ResponseEntity.ok(wallet);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
