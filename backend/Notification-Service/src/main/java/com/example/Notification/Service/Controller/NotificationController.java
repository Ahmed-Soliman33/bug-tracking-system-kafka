package com.example.Notification.Service.Controller;

import com.example.Notification.Service.Entity.Notification;
import com.example.Notification.Service.service.NotificationServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationServiceImpl notificationService;

    @PostMapping("/send")
    public Notification sendNotification(
            @RequestHeader("userId") Long senderId,
            @RequestParam Long receiverId,
            @RequestParam Long bugId,
            @RequestParam String message
    ) {

        return notificationService.sendNotification(senderId, receiverId, bugId, message);
    }
    // when user click on message this function invoked
    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable Long id){
        return notificationService.markAsRead(id);
    }
    // this function invoked when user click on notifications button
    @GetMapping("/my-notifications")
    public List<Notification> getUserNotifications(@RequestHeader("userId") Long userId){
        return notificationService.getUserNotifications(userId);
    }

}
