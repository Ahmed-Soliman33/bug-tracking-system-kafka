package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BugCreatedEvent {

    private Long bugId;
    private Long customerId; // sender
    private Long adminId; // receiver
    private String title; // title of bug
}
