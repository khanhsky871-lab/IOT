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

    // Giữ nguyên cho DashboardView.jsx
    public List<SensorDataDTO> getAllSensorData(int limit) {
        Page<SensorData> pageData = sensorDataRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        return pageData.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Tìm kiếm, lọc theo searchTarget và sắp xếp giá trị tại Backend
    public List<SensorDataDTO> getSensorData(int limit, String search, String searchTarget, String sortOrder) {
        String trimmedSearch = (search != null) ? search.trim().toLowerCase() : "";
        boolean hasSearch = !trimmedSearch.isEmpty();

        String target = (searchTarget != null && !searchTarget.isBlank()) ? searchTarget.trim() : "All";
        boolean isUnitFilter = "°C".equalsIgnoreCase(target) || "%".equalsIgnoreCase(target) || "lx".equalsIgnoreCase(target);
        String unitParam = isUnitFilter ? target : null;

        String sort = (sortOrder != null && !sortOrder.isBlank()) ? sortOrder.trim().toLowerCase() : "none";

        // Khi có từ khóa search, lấy tập dữ liệu lớn hơn để tìm sâu hơn trước khi giới hạn limit
        int fetchSize = hasSearch ? Math.max(limit, 5000) : Math.max(limit, 1);
        PageRequest pageRequest = PageRequest.of(0, fetchSize);

        Page<SensorData> pageData;
        if ("asc".equals(sort)) {
            pageData = sensorDataRepository.findFilteredOrderByValueAsc(unitParam, pageRequest);
        } else if ("desc".equals(sort)) {
            pageData = sensorDataRepository.findFilteredOrderByValueDesc(unitParam, pageRequest);
        } else {
            pageData = sensorDataRepository.findFilteredOrderByTimeDesc(unitParam, pageRequest);
        }

        return pageData.getContent().stream()
                .map(this::convertToDTO)
                .filter(dto -> {
                    if (!hasSearch) return true;

                    String idStr = dto.getId() != null ? dto.getId().toLowerCase() : "";
                    String typeStr = dto.getType() != null ? dto.getType().toLowerCase() : "";
                    String valueStr = dto.getValue() != null ? String.valueOf(dto.getValue()).toLowerCase() : "";
                    String unitStr = dto.getUnit() != null ? dto.getUnit().toLowerCase() : "";
                    String timeStr = dto.getTime() != null ? dto.getTime().toLowerCase() : "";

                    if (isUnitFilter) {
                        return valueStr.contains(trimmedSearch)
                                || idStr.contains(trimmedSearch)
                                || timeStr.contains(trimmedSearch);
                    }
                    if ("Time".equalsIgnoreCase(target)) {
                        return timeStr.contains(trimmedSearch);
                    }

                    return idStr.contains(trimmedSearch)
                            || typeStr.contains(trimmedSearch)
                            || valueStr.contains(trimmedSearch)
                            || unitStr.contains(trimmedSearch)
                            || timeStr.contains(trimmedSearch);
                })
                .limit(Math.max(limit, 1))
                .collect(Collectors.toList());
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