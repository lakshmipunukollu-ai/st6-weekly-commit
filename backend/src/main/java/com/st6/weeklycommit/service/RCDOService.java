package com.st6.weeklycommit.service;

import com.st6.weeklycommit.entity.DefiningObjective;
import com.st6.weeklycommit.entity.Outcome;
import com.st6.weeklycommit.entity.RallyCry;
import com.st6.weeklycommit.repository.DefiningObjectiveRepository;
import com.st6.weeklycommit.repository.OutcomeRepository;
import com.st6.weeklycommit.repository.RallyCryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class RCDOService {

    private final RallyCryRepository rallyCryRepository;
    private final DefiningObjectiveRepository objectiveRepository;
    private final OutcomeRepository outcomeRepository;

    public RCDOService(RallyCryRepository rallyCryRepository,
                       DefiningObjectiveRepository objectiveRepository,
                       OutcomeRepository outcomeRepository) {
        this.rallyCryRepository = rallyCryRepository;
        this.objectiveRepository = objectiveRepository;
        this.outcomeRepository = outcomeRepository;
    }

    public List<RallyCry> getRallyCries() {
        return rallyCryRepository.findByActiveTrue();
    }

    public List<DefiningObjective> getObjectives(UUID rallyCryId) {
        return objectiveRepository.findByRallyCryId(rallyCryId);
    }

    public List<Outcome> getOutcomes(UUID objectiveId) {
        return outcomeRepository.findByDefiningObjectiveId(objectiveId);
    }
}
