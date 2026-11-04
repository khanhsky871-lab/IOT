package com.helix.iot.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActionHistoryDTO {
    private Long recordId;
    private String id;          // "01", "02"
    private String name;        // "Đèn 1", "Đèn 2"
    private String action;      // "Turn on", "Turn off"
    private String triggerBy;   // "Manual"
    private String status;      // "Success", "Fail", "Pending"
    private String time;        // "21/08/2026 08:00:00"
    private String performedBy; // Tên User
}