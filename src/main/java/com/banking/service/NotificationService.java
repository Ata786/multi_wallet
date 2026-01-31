package com.banking.service;

import com.banking.model.Notification;
import com.banking.model.User;
import com.banking.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(User user, String type, String title, String message, double amount,
            String currency) {
        Notification notification = new Notification(user, type, title, message, amount, currency);
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // Helper methods for common notifications
    public void notifyTransferReceived(User recipient, String senderName, double amount, String currency) {
        createNotification(
                recipient,
                "TRANSFER_RECEIVED",
                "Money Received",
                "You received " + currency + " " + String.format("%.2f", amount) + " from " + senderName,
                amount,
                currency);
    }

    public void notifyTransferSent(User sender, String recipientName, double amount, String currency) {
        createNotification(
                sender,
                "TRANSFER_SENT",
                "Money Sent",
                "You sent " + currency + " " + String.format("%.2f", amount) + " to " + recipientName,
                amount,
                currency);
    }

    public void notifyDeposit(User user, double amount, String currency) {
        createNotification(
                user,
                "DEPOSIT",
                "Deposit Received",
                "Your wallet has been credited with " + currency + " " + String.format("%.2f", amount),
                amount,
                currency);
    }

    public void notifyConversion(User user, double fromAmount, String fromCurrency, double toAmount,
            String toCurrency) {
        createNotification(
                user,
                "CONVERSION",
                "Currency Converted",
                "You converted " + fromCurrency + " " + String.format("%.2f", fromAmount) + " to " + toCurrency + " "
                        + String.format("%.2f", toAmount),
                toAmount,
                toCurrency);
    }
}
