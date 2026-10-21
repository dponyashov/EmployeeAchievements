package ru.ponyashov.employee_achievements.utils;


import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import ru.ponyashov.employee_achievements.dto.request.ReportFilterRequestDto;

import java.util.ArrayList;
import java.util.List;


public class PageableUtils {

    public static Pageable toPageable(ReportFilterRequestDto dto) {
        List<Sort.Order> orders = new ArrayList<>();

        if (dto.sort() != null && !dto.sort().isEmpty()) {
            for (ReportFilterRequestDto.SortParameter sortParam : dto.sort()) {
                // Валидация разрешенных полей для защиты от SQL-инъекций через Order By
                String property = matchSortProperty(sortParam.property());
                if (property != null) {
                    Sort.Direction dir = sortParam.direction() != null ? sortParam.direction() : Sort.Direction.ASC;
                    orders.add(new Sort.Order(dir, property));
                }
            }
        }

        Sort sort = orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
        return PageRequest.of(dto.getPageOrDefault(), dto.getSizeOrDefault(), sort);
    }

    // Маппинг имен полей из запроса в имена полей вашей Entity
    private static String matchSortProperty(String clientProperty) {
        if (clientProperty == null) return null;
        return switch (clientProperty.toLowerCase()) {
//            case "department" -> "department.id"; // или просто "department" в зависимости от маппинга
//            case "position" -> "position.id";
            case "service" -> "service.id";
            case "component" -> "component.id";
            case "profile" -> "profile.id";
            case "year" -> "year";
            case "month" -> "month";
            default -> null; // Игнорируем неизвестные поля
        };
    }
}
