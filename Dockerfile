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

# Set correct DB connection as container-level ENV (overrides anything baked into the JAR)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require
ENV SPRING_DATASOURCE_USERNAME=postgres.tozpptsgpodiwnsyxzde
ENV JAVA_OPTS="-Djava.net.preferIPv4Stack=true"

COPY --from=builder /app/target/land-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
