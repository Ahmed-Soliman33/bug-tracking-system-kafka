package com.example.Bug.Service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "PROJECT-SERVICE")

public interface ProjectClient {

    @GetMapping("/projects/name/{name}")
    Object getProjectByName(@PathVariable String name);

    @GetMapping("/projects/name/{name}/admin")
    Long getProjectAdmin(@PathVariable String name);
}
