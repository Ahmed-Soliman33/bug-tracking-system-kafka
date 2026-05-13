package com.example.User_AuthService.userController;


import com.example.User_AuthService.DTO.ApiResponse;
import com.example.User_AuthService.DTO.LoginRequest;
import com.example.User_AuthService.userEntity.User;
import com.example.User_AuthService.userService.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/accounts")
public class AuthController {
    @Autowired
    private UserService userService;
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user){
        return ResponseEntity.ok(
                new ApiResponse<>(true, "User Registered Successfully", userService.register(user))
        );
    }

    @PostMapping("/login")
    // take the email and password
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest request) {
        User user = userService.login(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Success Login", user)
        );
    }
}
