package com.example.Project.Service.Exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectNotFoundException extends RuntimeException{
    private String message;
}
