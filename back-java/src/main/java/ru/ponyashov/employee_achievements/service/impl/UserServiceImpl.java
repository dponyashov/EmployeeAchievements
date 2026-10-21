package ru.ponyashov.employee_achievements.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.ponyashov.employee_achievements.dto.request.RegistryRequestDto;
import ru.ponyashov.employee_achievements.dto.request.UserRequestDto;
import ru.ponyashov.employee_achievements.dto.response.ResponseMessageDto;
import ru.ponyashov.employee_achievements.dto.response.RoleResponseDto;
import ru.ponyashov.employee_achievements.dto.response.UserResponseDto;
import ru.ponyashov.employee_achievements.entity.ProfileEntity;
import ru.ponyashov.employee_achievements.entity.RoleEntity;
import ru.ponyashov.employee_achievements.entity.UserEntity;
import ru.ponyashov.employee_achievements.mapper.UserMapper;
import ru.ponyashov.employee_achievements.repository.ProfileRepository;
import ru.ponyashov.employee_achievements.repository.RoleRepository;
import ru.ponyashov.employee_achievements.repository.UserRepository;
import ru.ponyashov.employee_achievements.service.UserService;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Collection<UserResponseDto> findAll() {
        return userRepository.findAll().stream()
                .map(entity -> {
                    return UserResponseDto.builder()
                            .id(entity.getId())
                            .userName(entity.getUsername())
                            .build();
                })
                .toList();
    }

    @Override
    public UserResponseDto findById(Long id) {
        var itemEntity = findEntityById(id);
        return UserResponseDto.builder()
                .id(itemEntity.getId())
                .userName(itemEntity.getUsername())
                .build();
    }

    @Override
    public UserResponseDto save(Long id, UserRequestDto dto) {
        var oldItem = findEntityById(id);

        if(dto.getPassword() != null){
            if(passwordIsNotValid(dto.getPassword())) {
                throw new RuntimeException("Пароль не соответствует требованиям");
            } else {
                oldItem.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
        }
        return saveItem(oldItem);
    }

    @Override
    public UserResponseDto save(RegistryRequestDto dto) {

        if(dto.getPassword() != null){
            if(passwordIsNotValid(dto.getPassword())) {
                throw new RuntimeException("Пароль не соответствует требованиям");
            }
        }

        var newItem = UserEntity.builder()
                .userName(dto.getUserName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .roles(roleRepository.findAllByNameIgnoreCase("ROLE_USER").stream().toList())
                .build();

        var savedUser = userRepository.save(newItem);

        var profile = profileRepository.findByEmail(savedUser.getUsername()).orElse(null);

        if(profile == null) {
            profile = ProfileEntity.builder()
                    .email(dto.getUserName())
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .build();
        }

        profile.setUser(savedUser);
        profileRepository.save(profile);

        return UserMapper.entityToDto(savedUser);
    }

    @Override
    public boolean delete(Long id) {
        findEntityById(id);
        userRepository.deleteById(id);
        return true;
    }

    @Override
//    @Transactional
    public Collection<RoleResponseDto> findAllRolesByUserId(Long userId) {
        var user = findEntityById(userId);

        return user.getRoles().stream()
                .map(role->{
                    return RoleResponseDto.builder()
                            .id(role.getId())
                            .name(role.getName())
                            .build();
                })
                .toList();
    }

    @Override
    public ResponseMessageDto addRoleByUser(Long userId, Long roleId) {
        var user = findEntityById(userId);

        var roleExists = user.getRoles().stream()
                .filter(role -> Objects.equals(role.getId(), roleId))
                .findFirst().orElse(null) != null;
        if(roleExists){
            throw new RuntimeException("Такая роль уже существует в списке пользователя");
        }

        var role = findRoleEntityById(roleId);
        user.getRoles().add(role);

        userRepository.save(user);

        return ResponseMessageDto.builder()
                .message(List.of("Роль добавлена"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @Override
    public ResponseMessageDto deleteRoleByUser(Long userId, Long roleId) {
        var user = findEntityById(userId);

        var roleNotExists = user.getRoles().stream()
                .filter(role -> Objects.equals(role.getId(), roleId))
                .findFirst().orElse(null) == null;
        if(roleNotExists){
            throw new RuntimeException("Такая роль НЕ существует в списке пользователя");
        }

        var role = findRoleEntityById(roleId);
        user.getRoles().remove(role);

        userRepository.save(user);

        return ResponseMessageDto.builder()
                .message(List.of("Роль удалена"))
                .statusText(HttpStatus.OK.name())
                .statusCode(HttpStatus.OK.value())
                .build();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @Override
    public Optional<UserEntity> findByUsername(String username) {
        return userRepository.findByUserName(username);
    }

    private UserEntity findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Пользователь с id %s не найден", id)));
    }

    private RoleEntity findRoleEntityById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(()-> new RuntimeException(String.format("Роль с id %s не найдена", id)));
    }

    private UserResponseDto saveItem(UserEntity item) {
        UserEntity savedItem = userRepository.save(item);
        return UserResponseDto.builder()
                .id(savedItem.getId())
                .userName(savedItem.getUsername())
                .build();
    }

    private boolean passwordIsNotValid(String password) {
        /// TODO тут проверка требований к паролю
        if (password.trim().isEmpty()) {
            return true;
        }
        return false;
    }
}
