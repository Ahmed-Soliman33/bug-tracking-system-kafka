package com.example.Bug.Service.Service;

import com.example.Bug.Service.DTO.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

// this class to communication between bug and notification service with apache kafka
@Service
public class BugEventProducer {
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // all these methods send the Events to Kafka Topics
    public void sendBugCreatedEvent(BugCreatedEvent event) {

        kafkaTemplate.send("bug-created-topic", // topic name
                        event.getBugId().toString(), event)
                .whenComplete((result, ex) -> {

                    if (ex == null) {
                        System.out.println("the Event has been sent successfully. BugID: " + event.getBugId());
                    } else {
                        System.err.println("Failed to send BugCreatedEvent: " + ex.getMessage());
                    }
                });
    }

    public void sendBugAssignedEvent(BugAssignedEvent event) {

        kafkaTemplate.send("bug-assigned-topic", event.getBugId().toString(), event);
    }

    public void sendBugSolvedEvent(BugSolvedEvent event) {

        kafkaTemplate.send("bug-solved-topic", event.getBugId().toString(), event);
    }

    public void sendCommentEvent(WriteCommentOnBugEvent event) {

        kafkaTemplate.send(
                "bug-comment-topic",
                event.getBugId().toString(),
                event
        );
    }

    public void sendAdminMessage(AdminMessageEvent event) {

        kafkaTemplate.send(
                "admin-message-topic",
                event.getBugId().toString(),
                event
        );
    }
}
