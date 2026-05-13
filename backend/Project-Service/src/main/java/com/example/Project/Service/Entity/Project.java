package com.example.Project.Service.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "project")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long projectId;

    @NotBlank(message = "Enter the project Name")
    @Column(name = "project_name")
    private String projectName;

    @NotBlank(message = "Enter the description")
    @Column(name = "description", length = 1000)
    private String description;
    @Column(name = "AdminId")
    private Long adminId; // User Admin id
}

