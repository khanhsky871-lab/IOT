package com.helix.iot.repository;

import com.helix.iot.entity.SensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    Page<SensorData> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT s FROM SensorData s " +
           "WHERE (:unit IS NULL OR LOWER(s.sensor.unit) = LOWER(:unit)) " +
           "ORDER BY s.createdAt DESC")
    Page<SensorData> findFilteredOrderByTimeDesc(@Param("unit") String unit, Pageable pageable);

    @Query("SELECT s FROM SensorData s " +
           "WHERE (:unit IS NULL OR LOWER(s.sensor.unit) = LOWER(:unit)) " +
           "ORDER BY s.value ASC, s.createdAt DESC")
    Page<SensorData> findFilteredOrderByValueAsc(@Param("unit") String unit, Pageable pageable);

    @Query("SELECT s FROM SensorData s " +
           "WHERE (:unit IS NULL OR LOWER(s.sensor.unit) = LOWER(:unit)) " +
           "ORDER BY s.value DESC, s.createdAt DESC")
    Page<SensorData> findFilteredOrderByValueDesc(@Param("unit") String unit, Pageable pageable);
}