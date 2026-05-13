package com.example.User_AuthService.Exceptions;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InvalidDataException extends RuntimeException{
    private String message;
}
