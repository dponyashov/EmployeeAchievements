package ru.ponyashov.employee_achievements.utils;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import ru.ponyashov.employee_achievements.dto.request.ReportFilterRequestDto;
import ru.ponyashov.employee_achievements.entity.TaskEntity;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import java.util.List;

public class TaskSpecification {

    public static Specification<TaskEntity> filterBy(ReportFilterRequestDto dto) {
        return (root, query, cb) -> {

            // Подгружаем связанные сущности в основном запросе.
            // Проверка на Long.class нужна, так как Spring Data делает count-запрос для пагинации,
            // а в count-запросах fetch использовать нельзя.
            if (query.getResultType() != Long.class) {
                root.fetch("profile", JoinType.LEFT);
//                root.fetch("department", JoinType.LEFT);
//                root.fetch("position", JoinType.LEFT);
                root.fetch("service", JoinType.LEFT);
                root.fetch("component", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (dto.years() != null && !dto.years().isEmpty()) {
                predicates.add(root.get("year").in(dto.years()));
            }
            if (dto.months() != null && !dto.months().isEmpty()) {
                predicates.add(root.get("month").in(dto.months()));
            }
            if (dto.profileIds() != null && !dto.profileIds().isEmpty()) {
                predicates.add(root.get("profile").get("id").in(dto.profileIds()));
            }
//            if (dto.positionIds() != null && !dto.positionIds().isEmpty()) {
//                predicates.add(root.get("profile").get("position").get("id").in(dto.positionIds()));
//            }
//            if (dto.departmentIds() != null && !dto.departmentIds().isEmpty()) {
//                predicates.add(root.get("profile").get("department").get("id").in(dto.departmentIds()));
//            }
            if (dto.serviceIds() != null && !dto.serviceIds().isEmpty()) {
                predicates.add(root.get("service").get("id").in(dto.serviceIds()));
            }
            if (dto.componentIds() != null && !dto.componentIds().isEmpty()) {
                predicates.add(root.get("component").get("id").in(dto.componentIds()));
            }

            if (dto.title() != null && !dto.title().isBlank()) {
                // Заменяем '*' на '%' для SQL-оператора LIKE, либо просто оборачиваем в % если маска не передана
                String searchPattern = dto.title().replace('*', '%');

//                Если нужно будет искать по части строки даже если в запросе нет * надо раскомментировать
//                if (!searchPattern.contains("%")) {
//                    searchPattern = "%" + searchPattern + "%";
//                }

                // Приводим поле и поисковый запрос к нижнему регистру для CaseIgnore
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        searchPattern.toLowerCase()
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
