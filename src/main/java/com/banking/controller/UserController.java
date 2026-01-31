package com.banking.controller;

import com.banking.dto.ChangePasswordRequest;
import com.banking.dto.UpdateProfileRequest;
import com.banking.model.Notification;
import com.banking.repository.UserRepository;
import com.banking.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "country", user.getCountry() != null ? user.getCountry() : "")))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    if (request.getName() != null && !request.getName().isEmpty()) {
                        user.setName(request.getName());
                    }
                    if (request.getPhone() != null) {
                        user.setPhone(request.getPhone());
                    }
                    if (request.getCountry() != null) {
                        user.setCountry(request.getCountry());
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Profile updated successfully",
                            "user", Map.of(
                                    "id", user.getId(),
                                    "name", user.getName(),
                                    "email", user.getEmail(),
                                    "phone", user.getPhone() != null ? user.getPhone() : "",
                                    "country", user.getCountry() != null ? user.getCountry() : "")));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    // Verify current password
                    if (!user.getPassword().equals(request.getCurrentPassword())) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
                    }

                    // Validate new password
                    if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "New password must be at least 6 characters"));
                    }

                    user.setPassword(request.getNewPassword());
                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Notification endpoints
    @GetMapping("/{id}/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getUserNotifications(id));
    }

    @GetMapping("/{id}/notifications/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(id));
    }

    @GetMapping("/{id}/notifications/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(id)));
    }

    @PostMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/notifications/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long id) {
        notificationService.markAllAsRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
