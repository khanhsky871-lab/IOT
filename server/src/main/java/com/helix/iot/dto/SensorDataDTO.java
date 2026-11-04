package com.helix.iot.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SensorDataDTO {
    private Long recordId;
    private String id;          // "SEN-01", "SEN-02"...
    private String sensorName;  // "DHT22 Temp"...
    private String type;        // "Temperature", "Humidity", "Light intensity"
    private Double value;       // 24.8
    private String unit;        // "°C", "%", "lx"
    private String status;      // "Normal", "High"
    private String time;        // "21/08/2026 08:00:00"
}