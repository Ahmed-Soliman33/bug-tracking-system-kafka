package com.example.Notification.Service.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Notification_id")
    private Long id;

    @NotNull(message = "sender is required")
    @Column(name = "sender_id")
    private Long senderId;

    @NotNull(message = "Receiver is required")
    @Column(name = "receiver_id")
    private Long receiverId;

    @NotBlank(message = "Message content is required")
    @Column(name = "message_content")
    private String message;

    @Column(name = "bug_Id")
    private Long bugId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @Column(name = "Creation_time")
    private LocalDateTime createdAt;
}
