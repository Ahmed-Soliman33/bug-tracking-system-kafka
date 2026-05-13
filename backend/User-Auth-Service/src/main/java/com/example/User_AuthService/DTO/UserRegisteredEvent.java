package com.example.User_AuthService.DTO;

import com.example.User_AuthService.userEntity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {

    private Long userId; // sender
    private Long adminId; // receiver
    private Role role;
    private String username;

}
