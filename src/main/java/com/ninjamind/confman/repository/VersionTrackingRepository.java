package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.VersionTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.VersionTracking}
 *
 * @author ehret_g
 */
public interface VersionTrackingRepository extends JpaRepository<VersionTracking, Long> {

    @Query(value = "SELECT v FROM VersionTracking v inner join v.applicationVersion as a WHERE a.application.id = :id order by v.code" )
    List<VersionTracking> findVersionTrackingByIdApp(@Param("id") Long id);

}
