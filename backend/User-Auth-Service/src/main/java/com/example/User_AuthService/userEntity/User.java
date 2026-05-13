package com.example.User_AuthService.userEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)

public class User {
    // user data
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "you should enter your name")
    @Column(name = "full_name")
    private String fullName;

    @NotBlank(message = "Please Enter the phone Number")
    @Column(name = "phoneNumber")
    private String phoneNumber;

    @Min(value = 21, message = "minimum age is 21")
    @Max(value = 60, message = "MAX age is 60")
    @Column(name = "Age")
    private Integer age;

    @Column(name = "Email", unique = true)
    @NotBlank(message = "Enter the email")
    private String email;

    @NotBlank(message = "Enter password")
    @Size(min = 8, message = "minimum Characters is 8")
    @Column(name = "Password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "the_Role")
    private Role role; // (Admin, staff, customer)


}
