package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ResponseMessageDto {
    private List<String> message;
    private String statusText;
    private int statusCode;
}
