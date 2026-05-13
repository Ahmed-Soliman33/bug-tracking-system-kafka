package com.example.Project.Service.Service;

import com.example.Project.Service.Entity.Project;
import com.example.Project.Service.Entity.Role;

import java.util.List;

public interface ProjectService {
    Project createProject(Project project, Role role);
    Project getProjectById(Long id);
    Project getProjectByName(String name);
    List<Project> getAllProjects();
    Project updateProject(Long id, Project project);
    void deleteProject(Long id, Role role);
}
