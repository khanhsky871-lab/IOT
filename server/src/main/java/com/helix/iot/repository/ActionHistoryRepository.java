package com.helix.iot.repository;

import com.helix.iot.entity.ActionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {
    Page<ActionHistory> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Tìm lệnh đang Pending mới nhất của thiết bị để xác nhận thành công
    Optional<ActionHistory> findFirstByDevice_IdAndStatusOrderByCreatedAtDesc(Long deviceId, String status);
}