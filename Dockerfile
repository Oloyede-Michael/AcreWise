# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy the entire land module
COPY land/pom.xml .
COPY land/.mvn .mvn
COPY land/mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY land/src ./src
RUN ./mvnw clean package -DskipTests -q

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/land-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
