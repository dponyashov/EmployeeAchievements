package ru.ponyashov.employee_achievements.controller.report;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ponyashov.employee_achievements.dto.request.ReportFilterRequestDto;
import ru.ponyashov.employee_achievements.dto.response.TaskResponseDto;
import ru.ponyashov.employee_achievements.entity.TaskEntity;
import ru.ponyashov.employee_achievements.service.TaskService;
import ru.ponyashov.employee_achievements.utils.TaskSpecification;
import ru.ponyashov.employee_achievements.utils.PageableUtils;

@RestController
@Tag(name = "Отчеты", description = "Управление отчетами")
@RequiredArgsConstructor
//@RequestMapping("/report")
@PreAuthorize("hasRole('REPORT')")
public class ReportController {
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<Page<TaskResponseDto>> getData( ReportFilterRequestDto filterDto) {
        // Преобразуем пагинацию и сортировку
        Pageable pageable = PageableUtils.toPageable(filterDto);

        // Создаем спецификацию фильтрации
        Specification<TaskEntity> spec = TaskSpecification.filterBy(filterDto);

        // Получаем страницу данных
        Page<TaskResponseDto> result = taskService.findAll(spec, pageable);

        return ResponseEntity.ok(result);
    }
}
