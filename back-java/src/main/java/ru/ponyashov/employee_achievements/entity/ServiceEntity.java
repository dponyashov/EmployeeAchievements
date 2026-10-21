package ru.ponyashov.employee_achievements.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Collection;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_services"
//        , schema = "bs_schema"
)
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    private Collection<TaskEntity> tasks;

}
