package com.example.User_AuthService.userRepository;

import com.example.User_AuthService.userEntity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // to make authentication find user by email
    Optional<User> findByEmail(String email);
}
