package com.example.User_AuthService.userService;

import com.example.User_AuthService.DTO.LoginRequest;
import com.example.User_AuthService.userEntity.Role;
import com.example.User_AuthService.userEntity.User;
import java.util.List;


// this interface to make abstraction
public interface UserService {
    User createUser(User user);
    User register(User user); // register invoke createUser so ADMIN create the user
    User login(LoginRequest request);
    List<User> getAllUsers(Role role);
    User getUserById(Long requestUserId, Long targetUserId, Role role);
    User updateUser(Long requestUserId, Long targetUserId, User user, Role role);
    void deleteUser(Long id, Role role);
}
