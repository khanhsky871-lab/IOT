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

    // Lấy dữ liệu cảm biến cho DashboardView.jsx và SensorView.jsx (hỗ trợ tìm kiếm, lọc & sắp xếp)
    @GetMapping("/data")
    public ResponseEntity<List<SensorDataDTO>> getSensorData(
            @RequestParam(defaultValue = "100000") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "All") String searchTarget,
            @RequestParam(defaultValue = "none") String sortOrder) {
        return ResponseEntity.ok(sensorService.getSensorData(limit, search, searchTarget, sortOrder));
    }
}