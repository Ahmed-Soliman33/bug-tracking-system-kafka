package com.example.User_AuthService.aspect;


import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.annotation.Configuration;

@Configuration
@Aspect
public class PerformanceAspect {


    @Around("execution(* com.example.User_AuthService.userService..*(..))")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {

        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long end = System.currentTimeMillis();

        System.out.println(joinPoint.getSignature().getName()
                + " executed in " + (end-start) + " ms");

        return result;
    }
}

