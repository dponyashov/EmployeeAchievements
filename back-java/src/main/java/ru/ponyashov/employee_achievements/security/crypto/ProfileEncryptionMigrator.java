package ru.ponyashov.employee_achievements.security.crypto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileEncryptionMigrator implements ApplicationRunner {

    private static final String ENC_PREFIX = "ENC:v1:";

    private final JdbcTemplate jdbcTemplate;
    private final EncryptedStringConverter encryptor;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id, first_name, last_name, phone FROM t_profiles"
        );

        int updatedCount = 0;

        for (Map<String, Object> row : rows) {
            Long id = ((Number) row.get("id")).longValue();
            String firstName = (String) row.get("first_name");
            String lastName = (String) row.get("last_name");
            String phone = (String) row.get("phone");

            boolean needsUpdate = false;

            if (isPlainText(firstName)) {
                firstName = encryptor.convertToDatabaseColumn(firstName);
                needsUpdate = true;
            }
            if (isPlainText(lastName)) {
                lastName = encryptor.convertToDatabaseColumn(lastName);
                needsUpdate = true;
            }
            if (isPlainText(phone)) {
                phone = encryptor.convertToDatabaseColumn(phone);
                needsUpdate = true;
            }

            if (needsUpdate) {
                jdbcTemplate.update(
                        "UPDATE t_profiles SET first_name = ?, last_name = ?, phone = ? WHERE id = ?",
                        firstName, lastName, phone, id
                );
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            log.info("Автоматически зашифрованы открытые ПДн в t_profiles (обновлено записей: {})", updatedCount);
        }
    }

    private boolean isPlainText(String value) {
        return value != null && !value.isBlank() && !value.startsWith(ENC_PREFIX);
    }
}
