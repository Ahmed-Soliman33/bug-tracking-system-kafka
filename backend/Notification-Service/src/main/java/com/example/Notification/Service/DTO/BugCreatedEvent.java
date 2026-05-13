package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BugCreatedEvent {

    private Long bugId;
    private String title;
    private Long adminId;
    private Long customerId;
}
