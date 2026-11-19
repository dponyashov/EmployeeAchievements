package ru.ponyashov.employee_achievements.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.ponyashov.employee_achievements.security.crypto.EncryptedStringConverter;

import java.util.Collection;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "t_profiles")
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "first_name", length = 512)
    private String firstName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "last_name", length = 512)
    private String lastName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone", length = 512)
    private String phone;

    @OneToOne(fetch = FetchType.LAZY)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private PositionEntity position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private DepartmentEntity department;

    @OneToMany(mappedBy = "profile", fetch = FetchType.LAZY)
    private Collection<TaskEntity> tasks;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private Collection<TaskEntity> tasksByAuthor;
}
