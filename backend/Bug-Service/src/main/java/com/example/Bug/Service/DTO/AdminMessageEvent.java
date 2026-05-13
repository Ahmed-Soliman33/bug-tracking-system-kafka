package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminMessageEvent {

    private Long bugId;
    private Long adminId;
    private Long customerId;
    private String message;
}
