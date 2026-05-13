package com.example.User_AuthService.userEntity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotEmpty;


@Entity
@DiscriminatorValue("STAFF")

public class Staff extends User{
    // the staff is full stack or backend or frontend
    @Enumerated(EnumType.STRING)
    private JobType job;

    public void setJob(JobType job) {
        this.job = job;
    }
    public JobType getJob() {
        return this.job;
    }
}
