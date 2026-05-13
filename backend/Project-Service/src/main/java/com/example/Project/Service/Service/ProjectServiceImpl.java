package com.example.Project.Service.Service;

import com.example.Project.Service.Entity.Project;
import com.example.Project.Service.Exception.ProjectNotFoundException;
import com.example.Project.Service.Repository.ProjectRepository;
import com.example.Project.Service.Entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public Project createProject(Project project, Role role) {
        // admin only create the project
        if (role == Role.ADMIN) {
            return projectRepository.save(project);
        }else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    @Override
    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new ProjectNotFoundException("Project not found"));
    }
    // get project by name
    @Override
    public Project getProjectByName(String name){
        return projectRepository.findByProjectName(name);
    }
    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Project updateProject(Long id, Project projectDetails) {
        Project project = getProjectById(id);

        project.setProjectName(projectDetails.getProjectName());
        project.setDescription(projectDetails.getDescription());
        project.setAdminId(projectDetails.getAdminId());

        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(Long id, Role role) {
        if (role == Role.ADMIN) {
            if (id != null) {
                projectRepository.deleteById(id);
            } else {
                throw new ProjectNotFoundException("project not found");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}
