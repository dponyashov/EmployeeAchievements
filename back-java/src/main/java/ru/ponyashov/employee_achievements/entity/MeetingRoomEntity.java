package ru.ponyashov.employee_achievements.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_meeting_rooms")
public class MeetingRoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 500)
    private String equipment;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
