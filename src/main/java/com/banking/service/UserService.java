package com.banking.service;

import com.banking.dto.LoginRequest;
import com.banking.dto.SignupRequest;
import com.banking.model.User;
import com.banking.model.Wallet;
import com.banking.repository.UserRepository;
import com.banking.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Transactional(rollbackFor = Exception.class)
    public User registerUser(SignupRequest request) throws Exception {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already exists");
        }

        // Create User
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash this!
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());

        user = userRepository.save(user);

        user = userRepository.save(user);

        // Determine currency based on country
        String currency = "USD";
        String symbol = "$";
        String flag = "🇺🇸";
        String walletName = "US Dollar Wallet";

        String country = request.getCountry() != null ? request.getCountry().toLowerCase() : "";

        if (country.contains("uk") || country.contains("united kingdom") || country.contains("britain")) {
            currency = "GBP";
            symbol = "£";
            flag = "🇬🇧";
            walletName = "British Pound Wallet";
        } else if (country.contains("india")) {
            currency = "INR";
            symbol = "₹";
            flag = "🇮🇳";
            walletName = "Indian Rupee Wallet";
        } else if (country.contains("germany") || country.contains("france") || country.contains("italy")
                || country.contains("spain") || country.contains("europe")) {
            currency = "EUR";
            symbol = "€";
            flag = "🇪🇺";
            walletName = "Euro Wallet";
        } else if (country.contains("japan")) {
            currency = "JPY";
            symbol = "¥";
            flag = "🇯🇵";
            walletName = "Japanese Yen Wallet";
        }

        // Create Single Default Wallet
        Wallet wallet = new Wallet(currency, symbol, 0.0, flag, walletName, user);
        wallet.setDailyChange(0.0);

        walletRepository.save(wallet);

        // Refresh user to get wallets
        return userRepository.findById(user.getId()).orElse(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public Wallet createWallet(Long userId, String currencyCode, double initialDeposit) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));

        // Prevent duplicate wallet
        if (user.getWallets().stream().anyMatch(w -> w.getCurrency().equalsIgnoreCase(currencyCode))) {
            throw new Exception("Wallet with this currency already exists");
        }

        String symbol = "$";
        String flag = "🇺🇸";
        String name = currencyCode + " Wallet";

        switch (currencyCode.toUpperCase()) {
            case "EUR":
                symbol = "€";
                flag = "🇪🇺";
                name = "Euro Wallet";
                break;
            case "GBP":
                symbol = "£";
                flag = "🇬🇧";
                name = "British Pound Wallet";
                break;
            case "INR":
                symbol = "₹";
                flag = "🇮🇳";
                name = "Indian Rupee Wallet";
                break;
            case "JPY":
                symbol = "¥";
                flag = "🇯🇵";
                name = "Japanese Yen Wallet";
                break;
            case "AUD":
                symbol = "A$";
                flag = "🇦🇺";
                name = "Australian Dollar Wallet";
                break;
            case "CAD":
                symbol = "C$";
                flag = "🇨🇦";
                name = "Canadian Dollar Wallet";
                break;
            case "USD":
                symbol = "$";
                flag = "🇺🇸";
                name = "US Dollar Wallet";
                break;
        }

        Wallet wallet = new Wallet(currencyCode.toUpperCase(), symbol, initialDeposit, flag, name, user);
        wallet.setDailyChange(0.0);

        return walletRepository.save(wallet);
    }

    public User loginUser(LoginRequest request) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(request.getPassword())) {
                return user;
            }
        }
        throw new Exception("Invalid email or password");
    }
}
