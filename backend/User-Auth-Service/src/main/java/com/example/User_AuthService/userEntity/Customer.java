package com.example.User_AuthService.userEntity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User{
}
