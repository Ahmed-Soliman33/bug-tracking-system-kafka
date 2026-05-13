package com.example.Notification.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {

    private Long userId; // sender
    private Long adminId; // receiver
    private String role;
    private String username;

}
