package com.helix.iot.service;

import com.helix.iot.dto.ActionHistoryDTO;
import com.helix.iot.dto.DeviceControlRequest;
import com.helix.iot.entity.ActionHistory;
import com.helix.iot.entity.Device;
import com.helix.iot.entity.User;
import com.helix.iot.repository.ActionHistoryRepository;
import com.helix.iot.repository.DeviceRepository;
import com.helix.iot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    @Value("${mqtt.topic.led1.set}")
    private String led1SetTopic;

    @Value("${mqtt.topic.led2.set}")
    private String led2SetTopic;

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final MqttService mqttService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public DeviceService(DeviceRepository deviceRepository, UserRepository userRepository,
                         ActionHistoryRepository actionHistoryRepository, MqttService mqttService) {
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
        this.actionHistoryRepository = actionHistoryRepository;
        this.mqttService = mqttService;
    }

    public ActionHistoryDTO controlDevice(DeviceControlRequest req) {
        Device device = deviceRepository.findById(req.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thiết bị ID: " + req.getDeviceId()));

        User user = (req.getUserId() != null)
                ? userRepository.findById(req.getUserId()).orElse(null)
                : userRepository.findById(1L).orElse(null);

        // 1. Lưu lịch sử ban đầu với trạng thái Pending
        ActionHistory history = ActionHistory.builder()
                .device(device)
                .user(user)
                .action(req.getAction()) // "Turn on" hoặc "Turn off"
                .triggerBy(req.getTriggerBy() != null ? req.getTriggerBy() : "Web Dashboard")
                .status("Pending")
                .build();
        history = actionHistoryRepository.save(history);

        // 2. Xác định Topic và Payload chuẩn cho ESP32 ("ON" hoặc "OFF")
        String targetTopic = (device.getId() == 1L) ? led1SetTopic : led2SetTopic;
        String payload = "Turn on".equalsIgnoreCase(req.getAction()) ? "ON" : "OFF";

        boolean published = mqttService.publishCommand(targetTopic, payload);

        if (published) {
            // Cập nhật trạng thái đèn và lịch sử thành Success
            device.setCurrentStatus(payload);
            deviceRepository.save(device);
            history.setStatus("Success");
        } else {
            history.setStatus("Fail");
        }

        history = actionHistoryRepository.save(history);
        return convertToDTO(history);
    }

    public List<ActionHistoryDTO> getAllHistory(int limit, String search, String deviceId, String action, String status) {
        Page<ActionHistory> page = actionHistoryRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
        return page.getContent().stream()
                .map(this::convertToDTO)
                .filter(dto -> {
                    boolean matchSearch = (search == null || search.isBlank()) ||
                            dto.getTime().toLowerCase().contains(search.toLowerCase()) ||
                            dto.getName().toLowerCase().contains(search.toLowerCase());
                    boolean matchId = (deviceId == null || deviceId.equals("All")) || dto.getId().equals(deviceId);
                    boolean matchAction = (action == null || action.equals("All")) || dto.getAction().equalsIgnoreCase(action);
                    boolean matchStatus = (status == null || status.equals("All")) || dto.getStatus().equalsIgnoreCase(status);
                    return matchSearch && matchId && matchAction && matchStatus;
                })
                .collect(Collectors.toList());
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    private ActionHistoryDTO convertToDTO(ActionHistory h) {
        return ActionHistoryDTO.builder()
                .recordId(h.getId())
                .id(String.format("%02d", h.getDevice().getId()))
                .name(h.getDevice().getDeviceName())
                .action(h.getAction())
                .triggerBy(h.getTriggerBy())
                .status(h.getStatus())
                .time(h.getCreatedAt() != null ? h.getCreatedAt().format(formatter) : "")
                .performedBy(h.getUser() != null ? h.getUser().getFullName() : "Đinh Gia Khánh")
                .build();
    }
}