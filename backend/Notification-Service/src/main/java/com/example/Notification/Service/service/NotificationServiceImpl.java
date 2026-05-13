package com.example.Notification.Service.service;

import com.example.Bug.Service.DTO.AdminMessageEvent;
import com.example.Bug.Service.DTO.BugAssignedEvent;
import com.example.Bug.Service.DTO.BugCreatedEvent;
import com.example.Bug.Service.DTO.BugSolvedEvent;
import com.example.Bug.Service.DTO.WriteCommentOnBugEvent;
import com.example.Notification.Service.DTO.UserRegisteredEvent;
import com.example.Notification.Service.Entity.Notification;
import com.example.Notification.Service.Entity.Status;
import com.example.Notification.Service.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    // this method creates notification from user to another user
    @Override
    public Notification sendNotification(Long senderId, Long receiverId, Long bugId, String message) {
        // creating notification object from Notification class
        Notification notification = new Notification();

        notification.setSenderId(senderId);
        notification.setReceiverId(receiverId);
        notification.setBugId(bugId);
        notification.setMessage(message);
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }
    @Override
    // notifications to different users
    public void notifyAdminNewBug(BugCreatedEvent event){

        System.out.println("Admin Notification: New Bug Created");
        Notification notification = new Notification();

        notification.setSenderId(event.getCustomerId());
        notification.setReceiverId(event.getAdminId());
        notification.setBugId(event.getBugId());
        notification.setMessage("New Bug Created by customer");
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    @Override
    public void notifyStaffBugAssigned(BugAssignedEvent event){

        System.out.println("Staff Notification: Bug Assigned");
        Notification notification = new Notification();

        notification.setSenderId(event.getAdminId());
        notification.setReceiverId(event.getStaffId());
        notification.setBugId(event.getBugId());
        notification.setMessage("New Bug Assigned to you");
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    @Override
    public void notifyCustomerBugSolved(BugSolvedEvent event){

        System.out.println("Customer Notification: Bug Solved");
        Notification notification = new Notification();

        notification.setSenderId(event.getStaffId());
        notification.setReceiverId(event.getCustomerId());
        notification.setBugId(event.getBugId());
        notification.setMessage("Bug has been solved");
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

    }
    @Override
    public void notifyAdminNewComment(WriteCommentOnBugEvent event){

        System.out.println("Admin Notification: New Comment");

        Notification notification = new Notification();

        notification.setSenderId(event.getStaffId());
        notification.setReceiverId(event.getAdminId());
        notification.setBugId(event.getBugId());
        notification.setMessage(event.getComment());
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    @Override
    public void notifyCustomerAdminMessage(AdminMessageEvent event) {
        System.out.println("new message.");

        Notification notification = new Notification();

        notification.setSenderId(event.getAdminId());
        notification.setReceiverId(event.getCustomerId());
        notification.setBugId(event.getBugId());
        notification.setMessage(event.getMessage());
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

    }
    @Override
    public void notifyAdminNewUser(UserRegisteredEvent event) {
        System.out.println("New User registered and its role: " + event.getRole() + " and its name is: " + event.getUsername());

        Notification notification = new Notification();

        notification.setSenderId(event.getUserId());
        notification.setReceiverId(event.getAdminId());
        notification.setMessage("New user Registered");
        notification.setStatus(Status.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    @Override
    // this function invoked when user click on message
    public Notification markAsRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("No Notifications"));

        // changing status
        notification.setStatus(Status.READ);
        return notificationRepository.save(notification);
    }
    @Override
    // this function invoked when user click on notification button
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByReceiverId(userId);
    }

}
