package com.example.Bug.Service.Service;

import com.example.Bug.Service.Entity.Bug;
import com.example.Bug.Service.Entity.BugPriority;
import com.example.Bug.Service.Entity.Role;

import java.util.List;

// interface to achieve abstraction
public interface BugService {
    Bug createBug(String title, String description, BugPriority priority, String projectName, Long customerId);
    Bug assignBug(Long bugId, Long adminId, Long staffId);
    Bug solveBug(Long bugId, Long staffId, Long customerId);
    void writeCommentOnBug(Long bugId, Long staffId, Long adminId, String comment);
    void adminMessage(Long bugId, Long adminId, Long customerId, String message);
    List<Bug> getAllBugs(Long id);
    Bug getBugById(Long bugId, Long userId, Role role);
    Bug updateBug(Long id, Long userId, Role role, Bug bugDetails);
    void deleteBug(Long id, Long userId, Role role);
}
