package ru.ponyashov.employee_achievements.utils;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import ru.ponyashov.employee_achievements.dto.request.ReportFilterRequestDto.SortParameter;

@Component
public class StringToSortParameterConverter implements Converter<String, SortParameter> {

    @Override
    public SortParameter convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }

        // Разделяем строку по запятой (например: "year,desc" -> ["year", "desc"])
        String[] parts = source.split(",");
        String property = parts[0].trim();

        Sort.Direction direction = Sort.Direction.ASC; // По умолчанию ASC
        if (parts.length > 1) {
            String dirString = parts[1].trim();
            if ("desc".equalsIgnoreCase(dirString)) {
                direction = Sort.Direction.DESC;
            }
        }

        return new SortParameter(property, direction);
    }
}
