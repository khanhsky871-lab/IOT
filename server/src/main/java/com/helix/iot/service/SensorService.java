package com.helix.iot.service;

import com.helix.iot.dto.SensorDataDTO;
import com.helix.iot.entity.Sensor;
import com.helix.iot.entity.SensorData;
import com.helix.iot.repository.SensorDataRepository;
import com.helix.iot.repository.SensorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SensorDataRepository sensorDataRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public SensorService(SensorRepository sensorRepository, SensorDataRepository sensorDataRepository) {
        this.sensorRepository = sensorRepository;
        this.sensorDataRepository = sensorDataRepository;
    }

    // Lưu giá trị đo mới từ MQTT vào bảng sensor_data
    public void saveSensorReading(Long sensorId, Double value) {
        if (value == null) return;
        sensorRepository.findById(sensorId).ifPresent(sensor -> {
            SensorData data = SensorData.builder()
                    .sensor(sensor)
                    .value(value)
                    .build();
            sensorDataRepository.save(data);
        });
    }

    // Lấy toàn bộ danh sách lịch sử cảm biến đã format cho React
    public List<SensorDataDTO> getAllSensorData(int limit) {
        Page<SensorData> pageData = sensorDataRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        return pageData.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private SensorDataDTO convertToDTO(SensorData data) {
        Sensor s = data.getSensor();
        String status = "Normal";
        if ("°C".equalsIgnoreCase(s.getUnit()) && data.getValue() > 35) status = "High";
        if ("lx".equalsIgnoreCase(s.getUnit()) && data.getValue() > 700) status = "High";

        return SensorDataDTO.builder()
                .recordId(data.getId())
                .id(String.format("SEN-%02d", s.getId()))
                .sensorName(s.getSensorName())
                .type(s.getSensorType())
                .value(data.getValue())
                .unit(s.getUnit())
                .status(status)
                .time(data.getCreatedAt() != null ? data.getCreatedAt().format(formatter) : "")
                .build();
    }
}