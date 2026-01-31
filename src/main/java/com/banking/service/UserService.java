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

        // Create Default Wallets (USD, EUR)
        Wallet usdWallet = new Wallet("USD", "$", 0.0, "🇺🇸", "US Dollar Wallet", user);
        usdWallet.setDailyChange(0.0);
        Wallet eurWallet = new Wallet("EUR", "€", 0.0, "🇪🇺", "Euro Wallet", user);
        eurWallet.setDailyChange(0.0);

        walletRepository.save(usdWallet);
        walletRepository.save(eurWallet);

        // Refresh user to get wallets
        return userRepository.findById(user.getId()).orElse(user);
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
