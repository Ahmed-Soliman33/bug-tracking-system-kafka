package com.example.User_AuthService.userService;

import com.example.User_AuthService.DTO.LoginRequest;
import com.example.User_AuthService.DTO.UserRegisteredEvent;
import com.example.User_AuthService.Exceptions.NoSuchUserExistsException;
import com.example.User_AuthService.Exceptions.UserAlreadyExistsException;
import com.example.User_AuthService.userEntity.*;
import com.example.User_AuthService.Exceptions.InvalidDataException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.User_AuthService.userRepository.UserRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// this is the service to perform business logic
@Service
public class UserServiceImpl implements UserService{

    @Autowired // to make dependency injection
    private UserRepository userRepository;

    @Autowired
    private RegisteredUserEventProducer registeredUserEventProducer;

    // this is the method to no duplicate code copying the data
    private void copyData(User sourceUser, User targetUser) {
        targetUser.setFullName(sourceUser.getFullName());
        targetUser.setPhoneNumber(sourceUser.getPhoneNumber());
        targetUser.setAge(sourceUser.getAge());
        targetUser.setEmail(sourceUser.getEmail());
        // hashing the password
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        targetUser.setPassword(encoder.encode(sourceUser.getPassword()));
        targetUser.setRole(sourceUser.getRole());
    }
    @Override
    // this function create new user in the database
    public User createUser(User user) {
        // create instance from Each type of User

        if (user.getRole() == Role.ADMIN) {
            // creating instance from admin
            Admin admin = new Admin();
            copyData(user, admin);
            return userRepository.save(admin);
        }

        if (user.getRole() == Role.STAFF) {
            // creating instance form Staff
            Staff staff = new Staff();
            copyData(user, staff);
            // create job additional feature
            staff.setJob(staff.getJob());
            return userRepository.save(staff);
        }

        if (user.getRole() == Role.CUSTOMER) {
            // creating instance form Customer
            Customer customer = new Customer();
            copyData(user, customer);
            return userRepository.save(customer);
        }

        throw new InvalidDataException("Invalid user type");
    }
    //Register form
    @Override
    // when the user register we invoke createUser function to create it
    public User register(User user) {
        //later I will apply hashing password
        // check if the email is already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()){
            throw new UserAlreadyExistsException("Email already exists");
        }
        User user1 = createUser(user);

        // sending the event to Kafka topic
        UserRegisteredEvent userRegisteredEvent = new UserRegisteredEvent(user1.getId(), user1.getId(), user1.getRole(), user1.getFullName());

        registeredUserEventProducer.sendRegisteredUser(userRegisteredEvent);

        return user1;
    }

    //login
    @Override
    public User login(LoginRequest request) {

        String email = request.getEmail();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode(request.getPassword());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchUserExistsException("User Not Found"));

        PasswordEncoder passwordEncoder = null;

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidDataException("Invalid password");
        }

        return user;  // take this data after login and store them in session frontend
    }
    @Override
    // we search to user using id
    // Admin can do this functionality
    public User getUserById(Long requestUserId, Long targetUserId, Role role) {
        User user =userRepository.findById(targetUserId)
                .orElseThrow( () -> new NoSuchUserExistsException("User Not Found"));
        if (role == Role.ADMIN) {
            return user;
        }
        if(role == Role.STAFF || role == Role.CUSTOMER) {
            // each user customer or staff can retrieve his personal profile
            if (requestUserId.equals(targetUserId)) {
                return user;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    // Admin can do this functionality
    public List<User> getAllUsers(Role role){
        if (role == Role.ADMIN){
            return userRepository.findAll();
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }


    @Override
    public User updateUser(Long requestUserId, Long targetUserId, User user, Role role) {
        // STAFF & CUSTOMER --> can update their own profile
       if (role == Role.CUSTOMER || role == Role.STAFF) {
            if(requestUserId.equals(targetUserId)){
                User existUser = getUserById(requestUserId, targetUserId, role);
                copyData(user, existUser);
                return userRepository.save(existUser);
            }
        }if (role == Role.ADMIN){
            // Admin can do this functionality can update any user
            User existUser = getUserById(requestUserId, targetUserId, role);
            copyData(user, existUser);
            return userRepository.save(existUser);
        }

       throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied you can not update other profiles");

    }

    @Override
    // delete user by id & Admin can do this functionality
    public void deleteUser(Long id, Role role) {
        if (role != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        // checking if the user exists
        if (userRepository.findById(id).isEmpty()){
            throw new NoSuchUserExistsException("user not found");
        }
        userRepository.deleteById(id);
    }
}
