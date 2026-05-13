package com.example.Notification.Service.service;



import com.example.Bug.Service.DTO.AdminMessageEvent;
import com.example.Bug.Service.DTO.BugAssignedEvent;
import com.example.Bug.Service.DTO.BugCreatedEvent;
import com.example.Bug.Service.DTO.BugSolvedEvent;
import com.example.Bug.Service.DTO.WriteCommentOnBugEvent;
import com.example.Notification.Service.DTO.UserRegisteredEvent;
import com.example.Notification.Service.Entity.Notification;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(Long senderId, Long receiverId, Long bugId, String message);
    void notifyAdminNewBug(BugCreatedEvent event);
    void notifyStaffBugAssigned(BugAssignedEvent event);
    void notifyCustomerBugSolved(BugSolvedEvent event);
    void notifyAdminNewComment(WriteCommentOnBugEvent event);
    void notifyCustomerAdminMessage(AdminMessageEvent event);
    void notifyAdminNewUser(UserRegisteredEvent event);
    Notification markAsRead(Long notificationId);
    List<Notification> getUserNotifications(Long userId);
}
