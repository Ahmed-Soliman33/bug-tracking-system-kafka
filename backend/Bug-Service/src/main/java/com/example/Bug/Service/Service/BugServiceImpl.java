package com.example.Bug.Service.Service;

import com.example.Bug.Service.Client.ProjectClient;
import com.example.Bug.Service.DTO.*;
import com.example.Bug.Service.Entity.BugPriority;
import com.example.Bug.Service.Entity.BugStatus;
import com.example.Bug.Service.Entity.Role;
import com.example.Bug.Service.Exception.BugNotFoundException;
import com.example.Bug.Service.Exception.ProjectNotFoundException;
import com.example.Bug.Service.Repository.BugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.example.Bug.Service.Entity.Bug;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
public class BugServiceImpl implements BugService{
    // dependency injection
    @Autowired
    private BugRepository bugRepository;
    // to receive the notifications
    @Autowired
    private BugEventProducer bugEventProducer;
    @Autowired
    private ProjectClient projectClient;

    @Override
    public Bug createBug(String title, String description, BugPriority priority, String projectName, Long customerId){

        Object project = projectClient.getProjectByName(projectName);

        if (project == null) {
            throw new ProjectNotFoundException("Project not found");
        }


        Bug bug = new Bug();

        bug.setTitle(title);
        bug.setDescription(description);
        bug.setPriority(priority);
        bug.setProjectName(projectName);
        bug.setCustomerId(customerId);
        bug.setStatus(BugStatus.OPEN);
        bug.setAssignedStaffId(null);

        Bug savedBug = bugRepository.save(bug);
        // getting the adminId from the project
        Long adminId = projectClient.getProjectAdmin(projectName);

        // event driven architecture & creating the event with the data
        BugCreatedEvent event = new BugCreatedEvent(bug.getId(), customerId // sender
                , adminId // receiver
                , bug.getTitle());

        // sending the event to Kafka topic
        bugEventProducer.sendBugCreatedEvent(event);
        return savedBug;

    }
    @Override
    // admin assign bug to staff
    public Bug assignBug(
            Long bugId,
            Long adminId,
            Long staffId) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new BugNotFoundException("Bug not found"));

        bug.setAssignedStaffId(staffId);

        if (bug.getStatus() != BugStatus.OPEN) {
            throw new RuntimeException("Bug Already Assigned");
        }
        bug.setStatus(BugStatus.ASSIGNED);

        Bug updatedBug = bugRepository.save(bug);

       // sending to Kafka topic — order: (bugId, staffId, adminId) matches DTO field order
        BugAssignedEvent  event = new BugAssignedEvent(bugId, staffId, adminId);
        bugEventProducer.sendBugAssignedEvent(event);

        return updatedBug;
    }
    @Override
    //staff solve bug and send notification
    public Bug solveBug(Long bugId,
                        Long staffId,
                        Long customerId){

        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new BugNotFoundException("Bug not found"));
        // if staff solve bug not assigned to it
        if(!staffId.equals(bug.getAssignedStaffId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        bug.setStatus(BugStatus.SOLVED);

        Bug updatedBug = bugRepository.save(bug);

        BugSolvedEvent event = new BugSolvedEvent("Bug Has Been Solved", staffId, customerId, bugId);

        bugEventProducer.sendBugSolvedEvent(event);
        return updatedBug;
    }
    @Override
    public void writeCommentOnBug(Long bugId,
                                  Long staffId,
                                  Long adminId,
                                  String comment) {

        WriteCommentOnBugEvent event = new WriteCommentOnBugEvent(bugId, staffId, adminId, comment);

        bugEventProducer.sendCommentEvent(event);
    }
    @Override
    // admin send message to the customer
    public void adminMessage(Long bugId,
                             Long adminId,
                             Long customerId,
                             String message){

        AdminMessageEvent event = new AdminMessageEvent(bugId, adminId, customerId, message);

        bugEventProducer.sendAdminMessage(event);

    }

    @Override
    public List<Bug> getAllBugs(Long BugId) {
        return bugRepository.findAll();
    }

    @Override
    public Bug getBugById(Long bugId, Long userId, Role role) {
        // in this function we will create logic access roles
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow( () -> new BugNotFoundException("Bug not Found"));
        if (role == Role.ADMIN) {
            return bug;
        }
        if (role == Role.STAFF && bug.getAssignedStaffId().equals(userId)) {
            return bug;
        }
        if (role == Role.CUSTOMER && bug.getCustomerId().equals(userId)) {
            return bug;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    @Override
    public Bug updateBug(Long id,Long userId, Role role, Bug bugDetails) {
        Bug bug = getBugById(id, userId, role);
        bug.setTitle(bugDetails.getTitle());
        bug.setDescription(bugDetails.getDescription());
        bug.setPriority(bugDetails.getPriority());
        bug.setStatus(bugDetails.getStatus());

        return bugRepository.save(bug);
    }

    @Override
    public void deleteBug(Long bugId,Long userId,Role role) {
        Bug bug = getBugById(bugId, userId, role);
        if (!Objects.equals(bug.getId(), bugId)){
            throw new BugNotFoundException("Bug Not Found");
        }
        bugRepository.delete(bug);
    }

}
