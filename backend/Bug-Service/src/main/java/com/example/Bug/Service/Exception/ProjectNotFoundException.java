package com.example.Bug.Service.Exception;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectNotFoundException extends RuntimeException {
    private String message;
}
