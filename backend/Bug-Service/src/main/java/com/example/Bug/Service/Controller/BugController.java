package com.example.Bug.Service.Controller;


import com.example.Bug.Service.DTO.*;
import com.example.Bug.Service.Entity.Role;
import com.example.Bug.Service.Service.BugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.Bug.Service.Entity.Bug;
import java.util.List;
@RestController
@RequestMapping("/bugs")
// we use DTO instead of dealing with entity directly
public class BugController {

    @Autowired
    private BugService bugService;

    //Post API to create bug
    @PostMapping("/insert")
    public Bug createBug(@RequestBody CreateBugRequest request, @RequestHeader("userId") Long customerId) {
        return bugService.createBug(request.getTitle(),
                request.getDescription(),
                request.getPriority(),
                request.getProjectName(),
                customerId);
    }

    // admin assign bug to specific staff
    @PutMapping("/assign")
    public Bug assignBug(@RequestBody AssignBugRequest request, @RequestHeader("userId") Long adminId) {
        return bugService.assignBug(request.getBugId(), adminId, request.getStaffId());
    }

    @PutMapping("/solve")
    public Bug solveBug(@RequestBody SolveBugRequest request, @RequestHeader("userId") Long staffId){

        return bugService.solveBug(request.getBugId(), staffId, request.getCustomerId());
    }


    @PostMapping("/comment")
    public void staffComment(@RequestBody StaffCommentRequest request, @RequestHeader("userId") Long staffId){

        bugService.writeCommentOnBug(request.getBugId(), staffId, request.getAdminId(),request.getComment());
    }


    @PostMapping("/admin-message")
    public void adminMessage(@RequestBody AdminMessageRequest request, @RequestHeader("userId") Long adminId){

        bugService.adminMessage(request.getBugId(), adminId, request.getCustomerId(), request.getMessage());
    }

    @GetMapping
    public List<Bug> getAllBugs() {
        return bugService.getAllBugs(null);
    }

    @GetMapping("/{bugId}")
    public Bug getBugById(@PathVariable Long bugId,
                          @RequestHeader("userId") Long userId,
                          @RequestHeader("role") Role role) {
        return bugService.getBugById(bugId, userId, role);
    }

    @PutMapping("/{id}")
    public Bug updateBug(@PathVariable Long id,
                         @RequestHeader("userId") Long userId,
                         @RequestHeader("role") Role role,
                         @RequestBody Bug bug) {
        return bugService.updateBug(id, userId, role, bug);
    }

    @DeleteMapping("/{id}")
    public void deleteBug(@PathVariable Long id,
                          @RequestHeader("userId") Long userId,
                          @RequestHeader("role") Role role) {
        bugService.deleteBug(id, userId, role);
    }
}
