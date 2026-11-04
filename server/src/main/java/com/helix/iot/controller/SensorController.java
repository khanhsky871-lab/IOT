package com.helix.iot.controller;

import com.helix.iot.dto.SensorDataDTO;
import com.helix.iot.service.SensorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    // Lấy danh sách dữ liệu cảm biến cho SensorView.jsx
    @GetMapping("/data")
    public ResponseEntity<List<SensorDataDTO>> getSensorData(@RequestParam(defaultValue = "250") int limit) {
        return ResponseEntity.ok(sensorService.getAllSensorData(limit));
    }
}