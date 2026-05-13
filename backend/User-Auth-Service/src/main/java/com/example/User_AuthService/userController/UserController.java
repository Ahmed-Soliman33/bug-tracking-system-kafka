package com.example.User_AuthService.userController;


import com.example.User_AuthService.userService.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.User_AuthService.userEntity.User;
import com.example.User_AuthService.userEntity.Role;
import java.util.List;
// before doing anything in the users you must insert your role an id
@RestController  // this to return JSON
@RequestMapping("/users") // this Specifies the endpoint
public class UserController {
    @Autowired
    private UserService userService;

    // to retrieve user from the database
    @GetMapping("/{targetUserId}")
    public User getUser(@PathVariable @Valid Long targetUserId,@RequestHeader("userId") Long requestUserId,@RequestHeader("role") Role role) {
        return userService.getUserById(requestUserId, targetUserId, role);
    }

    @GetMapping
    public List<User> getAllUsers(@RequestHeader("role") Role role){
        return userService.getAllUsers(role);
    }

    @PutMapping("/{targetUserId}")
    public void updateUser(@PathVariable @Valid  Long targetUserId, @RequestBody @Valid User user, @RequestHeader("userId") Long requestUserId, @RequestHeader("role") Role role) {
        userService.updateUser(requestUserId, targetUserId, user, role);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id, @RequestHeader("role") Role role) {
        userService.deleteUser(id, role);
    }


}
