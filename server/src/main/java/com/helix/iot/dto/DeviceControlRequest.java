package com.helix.iot.dto;

import lombok.Data;

@Data
public class DeviceControlRequest {
    private Long deviceId;      // Ví dụ: 1 (Đèn 1), 2 (Đèn 2)
    private Long userId;        // Ví dụ: 1
    private String action;      // "Turn on" hoặc "Turn off"
    private String triggerBy;   // "Web Dashboard"
}