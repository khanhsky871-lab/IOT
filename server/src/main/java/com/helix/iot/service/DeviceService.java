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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    @Value("${mqtt.topic.led1.set:esp32/led1/set}")
    private String led1SetTopic;

    @Value("${mqtt.topic.led2.set:esp32/led2/set}")
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

        User user = null;
        try {
            if (req.getUserId() != null) {
                user = userRepository.findById(req.getUserId()).orElse(null);
            }
            if (user == null) {
                user = userRepository.findById(1L).orElse(null);
            }
        } catch (Exception e) {
            user = null;
        }

        String actionText = "Turn on".equalsIgnoreCase(req.getAction()) ? "Turn on" : "Turn off";
        String payload = "Turn on".equalsIgnoreCase(actionText) ? "ON" : "OFF";

        // 1. Lưu lịch sử ban đầu với trạng thái Pending
        ActionHistory history = ActionHistory.builder()
                .device(device)
                .user(user)
                .action(actionText)
                .triggerBy(req.getTriggerBy() != null ? req.getTriggerBy() : "Web Dashboard")
                .status("Pending")
                .build();
        history = actionHistoryRepository.save(history);

        // 2. Xác định Topic và đăng ký chờ ACK từ ESP32 trước khi publish
        String targetTopic = (device.getId() == 1L) ? led1SetTopic : led2SetTopic;
        CompletableFuture<String> ackFuture = mqttService.registerPendingAck(device.getId());

        boolean published = mqttService.publishCommand(targetTopic, payload);
        if (!published) {
            mqttService.clearPendingAck(device.getId(), ackFuture);
            history.setStatus("FAIL");
            actionHistoryRepository.save(history);
            throw new RuntimeException("Không thể gửi lệnh tới MQTT Broker!");
        }

        // 3. Chờ phản hồi xác nhận từ ESP32 (tối đa 3 giây)
        try {
            String ackStatus = ackFuture.get(3, TimeUnit.SECONDS);
            if (payload.equalsIgnoreCase(ackStatus)) {
                device.setCurrentStatus(payload);
                deviceRepository.save(device);

                history.setStatus("SUCCESS");
                history = actionHistoryRepository.save(history);
                return convertToDTO(history);
            } else {
                history.setStatus("FAIL");
                actionHistoryRepository.save(history);
                throw new RuntimeException("Phản hồi từ ESP32 không khớp trạng thái mong muốn!");
            }
        } catch (TimeoutException e) {
            mqttService.clearPendingAck(device.getId(), ackFuture);
            history.setStatus("FAIL");
            actionHistoryRepository.save(history);
            throw new RuntimeException("ESP32 không phản hồi (đang ngắt nguồn hoặc mất kết nối)!");
        } catch (Exception e) {
            mqttService.clearPendingAck(device.getId(), ackFuture);
            history.setStatus("FAIL");
            actionHistoryRepository.save(history);
            throw new RuntimeException("Lỗi khi điều khiển thiết bị: " + e.getMessage());
        }
    }

    public List<ActionHistoryDTO> getAllHistory(int limit, String search, String deviceId, String action, String status) {
        try {
            Long deviceIdParam = null;
            if (deviceId != null && !deviceId.isBlank() && !"All".equalsIgnoreCase(deviceId)) {
                deviceIdParam = Long.parseLong(deviceId.trim());
            }

            String actionParam = (action != null && !action.isBlank() && !"All".equalsIgnoreCase(action)) ? action.trim() : null;
            String statusParam = (status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) ? status.trim() : null;
            String trimmedSearch = (search != null) ? search.trim().toLowerCase() : "";
            boolean hasSearch = !trimmedSearch.isEmpty();

            int fetchSize = hasSearch ? Math.max(limit, 5000) : Math.max(limit, 1);
            Page<ActionHistory> page = actionHistoryRepository.findFiltered(
                    deviceIdParam,
                    actionParam,
                    statusParam,
                    PageRequest.of(0, fetchSize)
            );

            return page.getContent().stream()
                    .map(this::convertToDTO)
                    .filter(dto -> {
                        if (!hasSearch) return true;
                        return dto.getId().toLowerCase().contains(trimmedSearch)
                                || dto.getName().toLowerCase().contains(trimmedSearch)
                                || dto.getAction().toLowerCase().contains(trimmedSearch)
                                || dto.getStatus().toLowerCase().contains(trimmedSearch)
                                || dto.getTime().toLowerCase().contains(trimmedSearch);
                    })
                    .limit(Math.max(limit, 1))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    public List<Device> getAllDevices() {
        mqttService.syncOfflineDevicesIfNeeded();
        return deviceRepository.findAll();
    }

    private ActionHistoryDTO convertToDTO(ActionHistory h) {
        String deviceName = "Đèn 1";
        String deviceIdStr = "1";
        if (h.getDevice() != null) {
            deviceIdStr = String.valueOf(h.getDevice().getId());
            if (h.getDevice().getDeviceName() != null) {
                deviceName = h.getDevice().getDeviceName();
            } else {
                deviceName = (h.getDevice().getId() == 2L) ? "Đèn 2" : "Đèn 1";
            }
        }

        String formattedTime = "";
        try {
            if (h.getCreatedAt() != null) {
                formattedTime = h.getCreatedAt().format(formatter);
            }
        } catch (Exception e) {
            formattedTime = h.getCreatedAt() != null ? h.getCreatedAt().toString() : "";
        }

        String fullName = "Đinh Gia Khánh";
        if (h.getUser() != null && h.getUser().getFullName() != null) {
            fullName = h.getUser().getFullName();
        }

        return ActionHistoryDTO.builder()
                .recordId(h.getId())
                .id(deviceIdStr)
                .name(deviceName)
                .action(h.getAction() != null ? h.getAction() : "Turn on")
                .triggerBy(h.getTriggerBy() != null ? h.getTriggerBy() : "Admin")
                .status(h.getStatus() != null ? h.getStatus().toUpperCase() : "SUCCESS")
                .time(formattedTime)
                .performedBy(fullName)
                .build();
    }
}