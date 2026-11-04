package com.helix.iot.controller;

import com.helix.iot.dto.ActionHistoryDTO;
import com.helix.iot.dto.DeviceControlRequest;
import com.helix.iot.entity.Device;
import com.helix.iot.service.DeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public ResponseEntity<List<Device>> getDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ActionHistoryDTO>> getHistory(
            @RequestParam(defaultValue = "500") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "All") String deviceId,
            @RequestParam(defaultValue = "All") String action,
            @RequestParam(defaultValue = "All") String status) {
        return ResponseEntity.ok(deviceService.getAllHistory(limit, search, deviceId, action, status));
    }

    @PostMapping("/control")
    public ResponseEntity<?> controlDevice(@RequestBody DeviceControlRequest request) {
        try {
            ActionHistoryDTO result = deviceService.controlDevice(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}