package com.example.Bug.Service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WriteCommentOnBugEvent {

    private Long bugId;
    private Long staffId;
    private Long adminId;
    private String comment;
}
