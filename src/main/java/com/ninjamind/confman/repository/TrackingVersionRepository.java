package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.TrackingVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author ehret_g
 */
public interface TrackingVersionRepository extends JpaRepository<TrackingVersion, Long> {

    @Query(value = "SELECT v FROM TrackingVersion v inner join v.applicationVersion as a WHERE a.application.id = :id order by v.code" )
    List<TrackingVersion> findTrackingVersionByIdApp(@Param("id") Long id);

    @Query(value = "SELECT v FROM TrackingVersion v inner join v.applicationVersion as a WHERE a.id = :id order by v.code" )
    List<TrackingVersion> findTrackingVersionByIdAppVersion(@Param("id") Long id);

}
