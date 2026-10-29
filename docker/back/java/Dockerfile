#FROM openjdk:21
# FROM eclipse-temurin:21-jdk
FROM eclipse-temurin:21-jre-alpine

ARG APP_FILE=/target/employee-achievements-0.0.1-SNAPSHOT.jar

COPY ${APP_FILE} /app/app.jar

WORKDIR /app

ENTRYPOINT ["java", "-jar", "app.jar"]