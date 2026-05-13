package com.example.Bug.Service.DTO;

import com.example.Bug.Service.Entity.BugPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateBugRequest {
    @NotBlank(message = "Title is required")

    private String title;
    private String description;
    private BugPriority priority;
    private String projectName;
}
