package com.example.Notification.Service.service;

import com.example.Bug.Service.DTO.AdminMessageEvent;
import com.example.Bug.Service.DTO.BugAssignedEvent;
import com.example.Bug.Service.DTO.BugCreatedEvent;
import com.example.Bug.Service.DTO.BugSolvedEvent;
import com.example.Bug.Service.DTO.WriteCommentOnBugEvent;
import com.example.Notification.Service.DTO.UserRegisteredEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;



@Service
public class NotificationConsumer {

        @Autowired
        private NotificationServiceImpl notificationService;
        // All this Functions Kafka invoke them not user or Frontend
        @KafkaListener(topics = "bug-created-topic", groupId = "notification-group")
        public void handleBugCreated(BugCreatedEvent event) {

            System.out.println("Notification Service received BUG CREATED event");

            System.out.println("Bug ID: " + event.getBugId());
            System.out.println("Title: " + event.getTitle());
            System.out.println("Admin ID: " + event.getAdminId());

            notificationService.notifyAdminNewBug(event);
        }

        @KafkaListener(topics = "bug-assigned-topic", groupId = "notification-group")
        public void handleBugAssigned(BugAssignedEvent event) {

            System.out.println("Bug assigned to staff: " + event.getStaffId());

            notificationService.notifyStaffBugAssigned(event);
        }

        @KafkaListener(topics = "bug-solved-topic", groupId = "notification-group")
        public void handleBugSolved(BugSolvedEvent event) {

            System.out.println("Bug solved: " + event.getBugId());

            System.out.println("Send notification to customer: " + event.getCustomerId());

            notificationService.notifyCustomerBugSolved(event);

        }


    @KafkaListener(topics = "bug-comment-topic", groupId = "notification-group")
    public void handleCommentEvent(WriteCommentOnBugEvent event) {

        System.out.println("New comment added on bug: " + event.getBugId());

        System.out.println("Comment: " + event.getComment());

        notificationService.notifyAdminNewComment(event);
    }

    @KafkaListener(topics = "admin-message-topic", groupId = "notification-group")
    public void handleAdminMessage(AdminMessageEvent event) {

        System.out.println("Admin message received");

        System.out.println("Admin ID: " + event.getAdminId());


        System.out.println("Message: " + event.getMessage());

        notificationService.notifyCustomerAdminMessage(event);
    }

    @KafkaListener(topics = "User-registered-event", groupId = "notification-group")
    public void handleUserRegistered(UserRegisteredEvent event){
        System.out.println("Admin message received");
        notificationService.notifyAdminNewUser(event);
    }
}
