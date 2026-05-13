package com.example.Bug.Service.Repository;

import com.example.Bug.Service.Entity.Bug;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BugRepository extends JpaRepository <Bug, Long> {
}
