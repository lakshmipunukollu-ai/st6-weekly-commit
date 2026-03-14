package com.st6.weeklycommit.config;

import com.st6.weeklycommit.entity.*;
import com.st6.weeklycommit.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    @Profile("seed")
    public CommandLineRunner seedData(
            UserRepository userRepo,
            RallyCryRepository rallyCryRepo,
            DefiningObjectiveRepository objectiveRepo,
            OutcomeRepository outcomeRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.count() > 0) return;

            // Create admin
            User admin = userRepo.save(User.builder()
                    .email("admin@st6.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("Admin User")
                    .role(User.Role.ADMIN)
                    .build());

            // Create manager
            User manager = userRepo.save(User.builder()
                    .email("manager@st6.com")
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .fullName("Sarah Manager")
                    .role(User.Role.MANAGER)
                    .build());

            // Create team members
            userRepo.save(User.builder()
                    .email("alice@st6.com")
                    .passwordHash(passwordEncoder.encode("member123"))
                    .fullName("Alice Developer")
                    .role(User.Role.MEMBER)
                    .managerId(manager.getId())
                    .build());

            userRepo.save(User.builder()
                    .email("bob@st6.com")
                    .passwordHash(passwordEncoder.encode("member123"))
                    .fullName("Bob Engineer")
                    .role(User.Role.MEMBER)
                    .managerId(manager.getId())
                    .build());

            // Seed RCDO hierarchy
            RallyCry rc1 = rallyCryRepo.save(RallyCry.builder()
                    .title("Ship Product v2.0")
                    .description("Launch the next major version of our product")
                    .active(true)
                    .build());

            RallyCry rc2 = rallyCryRepo.save(RallyCry.builder()
                    .title("Improve Developer Experience")
                    .description("Make our platform easier for developers to use")
                    .active(true)
                    .build());

            DefiningObjective do1 = objectiveRepo.save(DefiningObjective.builder()
                    .rallyCryId(rc1.getId())
                    .title("Complete Core Features")
                    .description("All P0 features shipped and tested")
                    .build());

            DefiningObjective do2 = objectiveRepo.save(DefiningObjective.builder()
                    .rallyCryId(rc1.getId())
                    .title("Performance Optimization")
                    .description("App loads in under 2 seconds")
                    .build());

            DefiningObjective do3 = objectiveRepo.save(DefiningObjective.builder()
                    .rallyCryId(rc2.getId())
                    .title("Improve API Documentation")
                    .description("Complete, accurate API docs with examples")
                    .build());

            outcomeRepo.save(Outcome.builder()
                    .definingObjectiveId(do1.getId())
                    .title("State Machine Implementation")
                    .description("Commit state machine fully tested")
                    .build());

            outcomeRepo.save(Outcome.builder()
                    .definingObjectiveId(do1.getId())
                    .title("Manager Dashboard Live")
                    .description("Dashboard shows real-time team data")
                    .build());

            outcomeRepo.save(Outcome.builder()
                    .definingObjectiveId(do2.getId())
                    .title("Query Optimization")
                    .description("All dashboard queries under 100ms")
                    .build());

            outcomeRepo.save(Outcome.builder()
                    .definingObjectiveId(do3.getId())
                    .title("API Reference Published")
                    .description("OpenAPI spec published and up to date")
                    .build());

            System.out.println("Seed data loaded successfully!");
        };
    }
}
