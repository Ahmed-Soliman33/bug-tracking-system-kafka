package com.example.Bug.Service.DTO;

import com.example.Bug.Service.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetBugRequest {

    private Long userId;
    private Role role;
}
