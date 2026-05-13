package com.example.User_AuthService.aspect;



import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class ExceptionAspect {

    @AfterThrowing(
            pointcut = "execution(* com.example.User_AuthService.userService..*(..))",
            throwing = "exception"
    )
    public void logException(JoinPoint joinPoint, Throwable exception){

        System.out.println("Exception in method: " + joinPoint.getSignature().getName());

        System.out.println("Exception message: "
                + exception.getMessage());

    }
}


