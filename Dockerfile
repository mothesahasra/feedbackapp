# Stage 1: Build stage with Java 21 JDK
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper files and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Normalize line endings for Windows CRLF compatibility and ensure execute permissions
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Copy project source code
COPY src ./src

# Package production executable JAR without running tests during image build
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime image with Java 21 JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a dedicated non-root system group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render injects the PORT environment variable at runtime (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
