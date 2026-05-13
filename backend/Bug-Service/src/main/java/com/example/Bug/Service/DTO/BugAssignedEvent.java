package com.example.Bug.Service.DTO;


import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BugAssignedEvent {

    private Long bugId;
    private Long staffId;
    private Long adminId;
}
