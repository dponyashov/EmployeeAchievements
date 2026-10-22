package ru.ponyashov.employee_achievements.dto.response;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class DirectoryDataDto {
    private String name;
    private String url;
}
