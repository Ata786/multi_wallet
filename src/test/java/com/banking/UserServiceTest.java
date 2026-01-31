package com.banking;

import com.banking.dto.SignupRequest;
import com.banking.model.User;
import com.banking.repository.UserRepository;
import com.banking.repository.WalletRepository;
import com.banking.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Test
    public void testUserRegistration() throws Exception {
        SignupRequest request = new SignupRequest(
                "Test User",
                "test@test.com",
                "password123",
                "1234567890",
                "USA");

        User registeredUser = userService.registerUser(request);

        Assertions.assertNotNull(registeredUser.getId());
        Assertions.assertEquals("Test User", registeredUser.getName());
        Assertions.assertEquals("test@test.com", registeredUser.getEmail());

        // Check wallets
        var wallets = walletRepository.findByUserId(registeredUser.getId());
        Assertions.assertEquals(2, wallets.size());

        Assertions.assertEquals("USD", wallets.get(0).getCurrency());
        Assertions.assertEquals(0.0, wallets.get(0).getDailyChange());
    }

    @Test
    public void testDuplicateEmail() {
        SignupRequest request1 = new SignupRequest(
                "User 1",
                "duplicate@test.com",
                "pass",
                "111",
                "UK");

        try {
            userService.registerUser(request1);
        } catch (Exception e) {
            Assertions.fail("First registration should succeed");
        }

        SignupRequest request2 = new SignupRequest(
                "User 2",
                "duplicate@test.com",
                "pass",
                "222",
                "UK");

        Assertions.assertThrows(Exception.class, () -> {
            userService.registerUser(request2);
        }, "Email already exists");
    }
}
