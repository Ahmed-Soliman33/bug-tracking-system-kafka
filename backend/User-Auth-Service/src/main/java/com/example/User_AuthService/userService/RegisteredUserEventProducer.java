package com.example.User_AuthService.userService;

import com.example.User_AuthService.DTO.UserRegisteredEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;

public class RegisteredUserEventProducer {
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendRegisteredUser(UserRegisteredEvent event){
        kafkaTemplate.send("User-registered-topic",event.getUserId().toString(), event)
                .whenComplete((result, ex) -> {

                    if (ex == null) {
                        System.out.println("the Event has been sent successfully. UserID: " + event.getUserId());
                    } else {
                        System.err.println("Failed to send UserRegisteredEvent: " + ex.getMessage());
                    }
                });
    }
}
