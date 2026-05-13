FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .

COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /build/target/Discovery-Service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9761

ENTRYPOINT ["java", "-jar", "app.jar"]