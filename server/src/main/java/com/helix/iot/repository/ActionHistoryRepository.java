package com.helix.iot.repository;

import com.helix.iot.entity.ActionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {

    Page<ActionHistory> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM ActionHistory a " +
           "WHERE (:deviceId IS NULL OR a.device.id = :deviceId) " +
           "AND (:action IS NULL OR LOWER(a.action) = LOWER(:action)) " +
           "AND (:status IS NULL OR LOWER(a.status) = LOWER(:status)) " +
           "ORDER BY a.createdAt DESC")
    Page<ActionHistory> findFiltered(
            @Param("deviceId") Long deviceId,
            @Param("action") String action,
            @Param("status") String status,
            Pageable pageable
    );

    // Tìm lệnh đang Pending mới nhất của thiết bị để xác nhận thành công
    Optional<ActionHistory> findFirstByDevice_IdAndStatusOrderByCreatedAtDesc(Long deviceId, String status);
}