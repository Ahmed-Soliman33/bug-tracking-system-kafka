package com.example.User_AuthService.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private long startTime;

    // Before method execution
    // we not invoke in the service when we send request to any method in user service this function automatic executed
    @Before("execution(* com.example.User_AuthService.service..*(..))")
    public void logBeforeMethod(JoinPoint joinPoint){

        startTime = System.currentTimeMillis();

        System.out.println("---- Method Start ----");

        System.out.println("Method: " + joinPoint.getSignature().getName());

        System.out.println("Parameters: " + Arrays.toString(joinPoint.getArgs()));
    }

    // After returning result
    @AfterReturning(
            pointcut = "execution(* com.example.User_AuthService.service..*(..))",
            returning = "result"
    )
    public void logAfterMethod(JoinPoint joinPoint, Object result){

        long executionTime = System.currentTimeMillis() - startTime;

        System.out.println("Method Executed: " + joinPoint.getSignature().getName());

        System.out.println("Returned Value: " + result);

        System.out.println("Execution Time: " + executionTime + " ms");

        System.out.println("---- Method End ----");
    }

    // Exception logging
    @AfterThrowing(
            pointcut = "execution(* com.example.User_AuthService.service..*(..))",
            throwing = "exception"
    )
    public void logException(JoinPoint joinPoint, Throwable exception){

        System.out.println("Exception in method: " + joinPoint.getSignature().getName());

        System.out.println("Error: " + exception.getMessage());
    }
}