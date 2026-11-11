package com.helix.iot.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username; // Có thể nhập email hoặc mã sinh viên
    private String password;
}