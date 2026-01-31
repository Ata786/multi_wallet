package com.banking.service;

import com.banking.dto.ConvertCurrencyRequest;
import com.banking.dto.TransferRequest;
import com.banking.model.Transaction;
import com.banking.model.User;
import com.banking.model.Wallet;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import com.banking.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransferService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CurrencyService currencyService;

    /**
     * Check if recipient exists and get their default wallet info
     */
    public Map<String, Object> checkRecipient(String email, String senderCurrency) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Map.of("exists", false, "message", "User not found with this email");
        }

        User recipient = userOpt.get();
        List<Wallet> wallets = walletRepository.findByUserId(recipient.getId());

        if (wallets.isEmpty()) {
            return Map.of("exists", false, "message", "Recipient has no wallet");
        }

        // Get the default wallet (first created = default)
        Wallet defaultWallet = wallets.get(0);

        // Get exchange rate if currencies differ
        double exchangeRate = currencyService.getExchangeRate(senderCurrency, defaultWallet.getCurrency());

        return Map.of(
                "exists", true,
                "recipientName", recipient.getName(),
                "recipientWalletId", defaultWallet.getId(),
                "recipientCurrency", defaultWallet.getCurrency(),
                "recipientSymbol", defaultWallet.getSymbol(),
                "exchangeRate", exchangeRate);
    }

    /**
     * Transfer money from sender wallet to recipient's default wallet
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> transfer(TransferRequest request) throws Exception {
        // Get sender wallet
        Wallet senderWallet = walletRepository.findById(request.getSenderWalletId())
                .orElseThrow(() -> new Exception("Sender wallet not found"));

        // Check sufficient balance
        if (senderWallet.getBalance() < request.getAmount()) {
            throw new Exception("Insufficient balance");
        }

        // Find recipient by email
        User recipient = userRepository.findByEmail(request.getRecipientEmail())
                .orElseThrow(() -> new Exception("Recipient not found"));

        // Get recipient's default wallet (first wallet created during registration)
        List<Wallet> recipientWallets = walletRepository.findByUserId(recipient.getId());
        if (recipientWallets.isEmpty()) {
            throw new Exception("Recipient has no wallet");
        }
        Wallet recipientWallet = recipientWallets.get(0);

        // Convert amount if currencies differ
        double convertedAmount = currencyService.convert(
                request.getAmount(),
                senderWallet.getCurrency(),
                recipientWallet.getCurrency());

        // Deduct from sender
        senderWallet.setBalance(senderWallet.getBalance() - request.getAmount());
        walletRepository.save(senderWallet);

        // Credit to recipient
        recipientWallet.setBalance(recipientWallet.getBalance() + convertedAmount);
        walletRepository.save(recipientWallet);

        // Create transaction records
        String description = "Transfer to " + recipient.getName();
        if (request.getNote() != null && !request.getNote().isEmpty()) {
            description += " - " + request.getNote();
        }

        Transaction senderTx = new Transaction(
                senderWallet,
                "TRANSFER",
                request.getAmount(),
                description,
                "SUCCESS",
                null);
        transactionRepository.save(senderTx);

        Transaction recipientTx = new Transaction(
                recipientWallet,
                "DEPOSIT",
                convertedAmount,
                "Received from " + senderWallet.getUser().getName(),
                "SUCCESS",
                null);
        transactionRepository.save(recipientTx);

        return Map.of(
                "success", true,
                "transactionId", senderTx.getId(),
                "amountSent", request.getAmount(),
                "amountReceived", convertedAmount,
                "recipientName", recipient.getName(),
                "senderNewBalance", senderWallet.getBalance());
    }

    /**
     * Convert currency between user's own wallets
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> convertCurrency(ConvertCurrencyRequest request) throws Exception {
        Wallet fromWallet = walletRepository.findById(request.getFromWalletId())
                .orElseThrow(() -> new Exception("Source wallet not found"));

        Wallet toWallet = walletRepository.findById(request.getToWalletId())
                .orElseThrow(() -> new Exception("Destination wallet not found"));

        // Ensure same user owns both wallets
        if (!fromWallet.getUser().getId().equals(toWallet.getUser().getId())) {
            throw new Exception("Both wallets must belong to the same user");
        }

        // Check sufficient balance
        if (fromWallet.getBalance() < request.getAmount()) {
            throw new Exception("Insufficient balance");
        }

        // Convert amount
        double convertedAmount = currencyService.convert(
                request.getAmount(),
                fromWallet.getCurrency(),
                toWallet.getCurrency());

        // Deduct from source wallet
        fromWallet.setBalance(fromWallet.getBalance() - request.getAmount());
        walletRepository.save(fromWallet);

        // Add to destination wallet
        toWallet.setBalance(toWallet.getBalance() + convertedAmount);
        walletRepository.save(toWallet);

        // Create transaction records
        Transaction fromTx = new Transaction(
                fromWallet,
                "CONVERSION",
                request.getAmount(),
                "Converted to " + toWallet.getCurrency(),
                "SUCCESS",
                null);
        transactionRepository.save(fromTx);

        Transaction toTx = new Transaction(
                toWallet,
                "DEPOSIT",
                convertedAmount,
                "Converted from " + fromWallet.getCurrency(),
                "SUCCESS",
                null);
        transactionRepository.save(toTx);

        return Map.of(
                "success", true,
                "amountDebited", request.getAmount(),
                "amountCredited", convertedAmount,
                "fromCurrency", fromWallet.getCurrency(),
                "toCurrency", toWallet.getCurrency(),
                "exchangeRate", currencyService.getExchangeRate(fromWallet.getCurrency(), toWallet.getCurrency()),
                "fromWalletBalance", fromWallet.getBalance(),
                "toWalletBalance", toWallet.getBalance());
    }
}
