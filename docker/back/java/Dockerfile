#FROM openjdk:21
FROM eclipse-temurin:21-jdk

ARG APP_FILE=/target/employee-achievements-0.0.1-SNAPSHOT.jar

COPY ${APP_FILE} /app/app.jar

WORKDIR /app

ENTRYPOINT ["java", "-jar", "app.jar"]
