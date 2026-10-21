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
@Table(name = "t_positions"
//        , schema = "bs_schema"
)
public class PositionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "position", fetch = FetchType.LAZY) //(cascade = CascadeType.ALL, orphanRemoval = true)
    private Collection<ProfileEntity> profiles;
}