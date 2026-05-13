package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AdminMessageRequest {
    private Long bugId;
    private Long customerId;
    private String message;
}
