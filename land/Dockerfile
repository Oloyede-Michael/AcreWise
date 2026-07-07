# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Cache dependencies first
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN ./mvnw clean package -DskipTests -q

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the compiled JAR from the builder stage
COPY --from=builder /app/target/land-0.0.1-SNAPSHOT.jar app.jar

# Expose the port Spring Boot listens on
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
