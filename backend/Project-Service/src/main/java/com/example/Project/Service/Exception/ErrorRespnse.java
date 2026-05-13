package com.example.Project.Service.Exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorRespnse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

}
