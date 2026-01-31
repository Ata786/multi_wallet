package com.banking.repository;

import com.banking.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUser_IdAndIsReadFalse(Long userId);
}
