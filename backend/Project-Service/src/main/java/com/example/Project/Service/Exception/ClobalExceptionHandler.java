package com.example.Project.Service.Exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class ClobalExceptionHandler {
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorRespnse> handleProjectNotFound(
            ProjectNotFoundException ex,
            HttpServletRequest request) {
        ErrorRespnse error = new ErrorRespnse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Project Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
