package ru.ponyashov.employee_achievements.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;

import java.util.List;

public record ReportFilterRequestDto(
        String title,
        // Фильтры (поддерживают одиночные значения и списки)
        List<   @Min(value = 1900, message = "Год должен быть не меньше 1900")
                @Max(value = 9999, message = "Год должен быть не больше 9999")
                Long> years,
        List<   @Min(value = 1, message = "Месяц должен быть не меньше 1")
                @Max(value = 12, message = "Месяц должен быть не больше 12")
                Long> months,
        List<@Min(value = 1, message = "Id должен быть не меньше 1") Long> profileIds,
//        List<@Min(value = 1, message = "Id должен быть не меньше 1") Long> positionIds,
//        List<@Min(value = 1, message = "Id должен быть не меньше 1") Long> departmentIds,
        List<@Min(value = 1, message = "Id должен быть не меньше 1") Long> serviceIds,
        List<@Min(value = 1, message = "Id должен быть не меньше 1") Long> componentIds,

        // Сортировка (список пар: поле + направление)
        List<SortParameter> sort,

        // Пагинация (с дефолтными значениями)
        @Min(0) Integer page,
        @Min(1) Integer size
) {
    // Внутренний рекорд для параметров сортировки
    public record SortParameter(
            String property, // "department", "service", "employee", "year", "month"
            Sort.Direction direction // ASC или DESC
    ) {}

    // Вспомогательный метод для получения дефолтной страницы
    public int getPageOrDefault() {
        return page != null ? page : 0;
    }

    // Вспомогательный метод для получения дефолтного размера страницы
    public int getSizeOrDefault() {
        return size != null ? size : 20;
    }

//    /**
//     * Формирует объект Pageable, объединяющий пагинацию и динамическую сортировку.
//     */
//    public Pageable toPageable() {
//        // 1. Если сортировка не передана, возвращаем пагинацию без сортировки (или с дефолтной)
//        if (sort == null || sort.isEmpty()) {
//            return PageRequest.of(getPageOrDefault(), getSizeOrDefault());
//        }
//
//        // 2. Преобразуем наш внутренний список SortParameter в список Order для Spring Data
//        List<Sort.Order> orders = sort.stream()
//                .map(p -> {
//                    Sort.Direction dir = p.direction() != null ? p.direction() : Sort.Direction.ASC;
//                    return new Sort.Order(dir, p.property());
//                })
//                .toList();
//
//        // 3. Возвращаем полный объект PageRequest
//        return PageRequest.of(getPageOrDefault(), getSizeOrDefault(), Sort.by(orders));
//    }
}
