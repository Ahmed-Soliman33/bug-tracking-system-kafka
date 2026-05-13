package com.example.Project.Service.Controller;

import com.example.Project.Service.Entity.Project;
import com.example.Project.Service.Entity.Role;
import com.example.Project.Service.Service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
// send with project details your role
public class ProjectController {
    @Autowired
    private ProjectService projectService;

    @GetMapping("/{projectId}")
    public Project getProjectById(@PathVariable Long projectId) {
        return projectService.getProjectById(projectId);
    }

    @GetMapping("/name/{projectName}")
    public Project getProjectByName(@PathVariable String projectName){
        return projectService.getProjectByName(projectName);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/name/{projectName}/admin")
    public Long getProjectAdmin(@PathVariable String projectName) {
        Project project = projectService.getProjectByName(projectName);
        return project.getAdminId();
    }

    @PostMapping("/insert")
    public Project createProject(@RequestBody @Valid Project project, @RequestHeader("role") Role role) {
        return projectService.createProject(project, role);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectService.updateProject(id,project);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id, @RequestBody Role role) {
        projectService.deleteProject(id, role);
    }
}
