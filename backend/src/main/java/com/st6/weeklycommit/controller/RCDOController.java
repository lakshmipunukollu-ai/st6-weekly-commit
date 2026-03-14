package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.entity.DefiningObjective;
import com.st6.weeklycommit.entity.Outcome;
import com.st6.weeklycommit.entity.RallyCry;
import com.st6.weeklycommit.service.RCDOService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rcdo")
public class RCDOController {

    private final RCDOService rcdoService;

    public RCDOController(RCDOService rcdoService) {
        this.rcdoService = rcdoService;
    }

    @GetMapping("/rally-cries")
    public ResponseEntity<List<RallyCry>> getRallyCries() {
        return ResponseEntity.ok(rcdoService.getRallyCries());
    }

    @GetMapping("/rally-cries/{id}/objectives")
    public ResponseEntity<List<DefiningObjective>> getObjectives(@PathVariable UUID id) {
        return ResponseEntity.ok(rcdoService.getObjectives(id));
    }

    @GetMapping("/objectives/{id}/outcomes")
    public ResponseEntity<List<Outcome>> getOutcomes(@PathVariable UUID id) {
        return ResponseEntity.ok(rcdoService.getOutcomes(id));
    }
}
