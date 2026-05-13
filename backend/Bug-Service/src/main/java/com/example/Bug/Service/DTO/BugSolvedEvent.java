package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BugSolvedEvent {

    private String message;
    private Long staffId;
    private Long customerId;
    private Long bugId;
}
