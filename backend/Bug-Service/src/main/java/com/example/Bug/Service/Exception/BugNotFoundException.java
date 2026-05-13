package com.example.Bug.Service.Exception;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class BugNotFoundException extends RuntimeException {
    private String message;

}
