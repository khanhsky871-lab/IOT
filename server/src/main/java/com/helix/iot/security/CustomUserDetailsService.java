package com.helix.iot.security;

import com.helix.iot.entity.User;
import com.helix.iot.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String cleanInput = username == null ? "" : username.trim();
        User user = userRepository.findByEmailOrStudentId(cleanInput, cleanInput)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + cleanInput));

        String principal = (user.getStudentId() != null && !user.getStudentId().isBlank())
                ? user.getStudentId().trim()
                : user.getEmail().trim();

        String dbPassword = user.getPassword() != null ? user.getPassword().trim() : "";

        return new org.springframework.security.core.userdetails.User(
                principal,
                dbPassword,
                Collections.emptyList()
        );
    }
}