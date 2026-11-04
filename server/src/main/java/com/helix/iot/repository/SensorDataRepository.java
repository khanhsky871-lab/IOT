package com.helix.iot.repository;

import com.helix.iot.entity.SensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    Page<SensorData> findAllByOrderByCreatedAtDesc(Pageable pageable);
}