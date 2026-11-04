package com.helix.iot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.helix.iot.repository.ActionHistoryRepository;
import com.helix.iot.repository.DeviceRepository;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class MqttService implements MqttCallback {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.username}")
    private String username;

    @Value("${mqtt.password}")
    private String password;

    @Value("${mqtt.topic.sensor}")
    private String sensorTopic;

    @Value("${mqtt.topic.led1.status}")
    private String led1StatusTopic;

    @Value("${mqtt.topic.led2.status}")
    private String led2StatusTopic;

    private MqttClient client;
    private final SensorService sensorService;
    private final DeviceRepository deviceRepository;
    private final ActionHistoryRepository actionHistoryRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MqttService(SensorService sensorService,
                       DeviceRepository deviceRepository,
                       ActionHistoryRepository actionHistoryRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.sensorService = sensorService;
        this.deviceRepository = deviceRepository;
        this.actionHistoryRepository = actionHistoryRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void init() {
        connectMqtt();
    }

    private void connectMqtt() {
        try {
            client = new MqttClient(brokerUrl, clientId + "_" + System.currentTimeMillis());
            MqttConnectOptions options = new MqttConnectOptions();
            options.setAutomaticReconnect(true);
            options.setCleanSession(true);
            options.setConnectionTimeout(10);

            if (username != null && !username.isEmpty()) {
                options.setUserName(username);
                options.setPassword(password.toCharArray());
            }

            client.setCallback(this);
            client.connect(options);

            // Subscribe các topic của ESP32
            client.subscribe(sensorTopic, 1);
            client.subscribe(led1StatusTopic, 1);
            client.subscribe(led2StatusTopic, 1);

            System.out.println("✅ Đã kết nối MQTT Broker! Đang lắng nghe: " + sensorTopic + ", " + led1StatusTopic + ", " + led2StatusTopic);
        } catch (MqttException e) {
            System.err.println("⚠️ Không thể kết nối MQTT Broker (" + brokerUrl + "): " + e.getMessage());
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        String payload = new String(message.getPayload());

        // 1. XỬ LÝ DỮ LIỆU CẢM BIẾN TỪ ESP32: {"temp": 25.4, "humidity": 60.0, "light": 720}
        if (topic.equals(sensorTopic)) {
            try {
                JsonNode json = objectMapper.readTree(payload);
                Double temp = json.has("temp") ? json.get("temp").asDouble() : 
                             (json.has("temperature") ? json.get("temperature").asDouble() : null);
                Double humid = json.has("humidity") ? json.get("humidity").asDouble() : null;
                Double light = json.has("light") ? json.get("light").asDouble() : null;

                // Lưu vào SQL Server (ID 1: Nhiệt độ, ID 2: Độ ẩm, ID 3: Ánh sáng)
                sensorService.saveSensorReading(1L, temp);
                sensorService.saveSensorReading(2L, humid);
                sensorService.saveSensorReading(3L, light);

                // Đẩy dữ liệu realtime qua WebSocket xuống React
                Map<String, Object> realtimeData = new HashMap<>();
                realtimeData.put("temperature", temp);
                realtimeData.put("humidity", humid);
                realtimeData.put("light", light);
                realtimeData.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

                messagingTemplate.convertAndSend("/topic/sensors", realtimeData);
            } catch (Exception e) {
                System.err.println("❌ Lỗi phân tích JSON cảm biến: " + e.getMessage());
            }
        }
        // 2. XỬ LÝ PHẢN HỒI TRẠNG THÁI ĐÈN 1 TỪ ESP32 ("LED1 is ON" / "LED1 is OFF")
        else if (topic.equals(led1StatusTopic)) {
            boolean isOn = payload.toUpperCase().contains("ON");
            updateDeviceAndHistoryStatus(1L, isOn ? "ON" : "OFF");
        }
        // 3. XỬ LÝ PHẢN HỒI TRẠNG THÁI ĐÈN 2 TỪ ESP32 ("LED2 is ON" / "LED2 is OFF")
        else if (topic.equals(led2StatusTopic)) {
            boolean isOn = payload.toUpperCase().contains("ON");
            updateDeviceAndHistoryStatus(2L, isOn ? "ON" : "OFF");
        }
    }

    private void updateDeviceAndHistoryStatus(Long deviceId, String newStatus) {
        // Cập nhật trạng thái hiện tại trong bảng devices
        deviceRepository.findById(deviceId).ifPresent(device -> {
            device.setCurrentStatus(newStatus);
            deviceRepository.save(device);
        });

        // Cập nhật bản ghi lịch sử đang Pending thành Success
        actionHistoryRepository.findFirstByDevice_IdAndStatusOrderByCreatedAtDesc(deviceId, "Pending")
                .ifPresent(history -> {
                    history.setStatus("Success");
                    actionHistoryRepository.save(history);
                });

        // Báo qua WebSocket cho Frontend đồng bộ nút gạt
        messagingTemplate.convertAndSend("/topic/devices", Map.of(
                "deviceId", deviceId,
                "status", newStatus
        ));
    }

    public boolean publishCommand(String topic, String message) {
        try {
            if (client != null && client.isConnected()) {
                MqttMessage mqttMessage = new MqttMessage(message.getBytes());
                mqttMessage.setQos(1);
                client.publish(topic, mqttMessage);
                return true;
            }
        } catch (MqttException e) {
            System.err.println("❌ Lỗi publish MQTT: " + e.getMessage());
        }
        return false;
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.err.println("⚠️ Mất kết nối MQTT: " + cause.getMessage());
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {}
}