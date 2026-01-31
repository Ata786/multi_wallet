package com.banking.controller;

import com.banking.dto.ConvertCurrencyRequest;
import com.banking.dto.TransferRequest;
import com.banking.service.CurrencyService;
import com.banking.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transfer")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @Autowired
    private CurrencyService currencyService;

    @GetMapping("/check-recipient")
    public ResponseEntity<?> checkRecipient(
            @RequestParam String email,
            @RequestParam String senderCurrency) {
        return ResponseEntity.ok(transferService.checkRecipient(email, senderCurrency));
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@RequestBody TransferRequest request) {
        try {
            Map<String, Object> result = transferService.transfer(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/convert")
    public ResponseEntity<?> convertCurrency(@RequestBody ConvertCurrencyRequest request) {
        try {
            Map<String, Object> result = transferService.convertCurrency(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/exchange-rates")
    public ResponseEntity<?> getExchangeRates() {
        return ResponseEntity.ok(currencyService.getExchangeRates());
    }

    @GetMapping("/exchange-rate")
    public ResponseEntity<?> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {
        double rate = currencyService.getExchangeRate(from, to);
        return ResponseEntity.ok(Map.of("from", from, "to", to, "rate", rate));
    }
}
