export JAVA_HOME := /opt/homebrew/Cellar/openjdk@21/21.0.10/libexec/openjdk.jdk/Contents/Home

.PHONY: dev test seed build clean

dev:
	@echo "Starting backend on port 8081 and frontend on port 5005..."
	cd backend && ./mvnw spring-boot:run &
	cd frontend && npm run dev

test:
	cd backend && ./mvnw test -Dspring.profiles.active=test
	cd frontend && npm test -- --run

seed:
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=seed

build:
	cd backend && ./mvnw clean package -DskipTests
	cd frontend && npm run build

clean:
	cd backend && ./mvnw clean
	cd frontend && rm -rf dist node_modules
