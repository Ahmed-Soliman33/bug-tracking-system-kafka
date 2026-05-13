package com.example.Project.Service.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Project.Service.Entity.Project;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Project findByProjectName(String name);
}
