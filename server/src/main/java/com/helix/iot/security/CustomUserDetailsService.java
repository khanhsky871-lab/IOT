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
        User user = userRepository.findByEmailOrStudentId(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + username));

        String principal = (user.getStudentId() != null && !user.getStudentId().isBlank())
                ? user.getStudentId()
                : user.getEmail();

        return new org.springframework.security.core.userdetails.User(
                principal,
                user.getPassword(),
                Collections.emptyList()
        );
    }
}