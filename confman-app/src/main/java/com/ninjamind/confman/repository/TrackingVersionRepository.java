package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.TrackingVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author Guillaume EHRET
 */
public interface TrackingVersionRepository extends ConfmanRepository<TrackingVersion, Long> {
    @Query(value = "SELECT a FROM TrackingVersion a WHERE a.active = true")
    List<TrackingVersion> findAllActive();

    @Query(value = "SELECT v FROM TrackingVersion v inner join v.applicationVersion as a WHERE a.application.id = :id order by v.code" )
    List<TrackingVersion> findByIdApp(@Param("id") Long id);

    @Query(value = "SELECT v FROM TrackingVersion v inner join v.applicationVersion as a WHERE a.id = :id order by v.code" )
    List<TrackingVersion> findByIdAppVersion(@Param("id") Long id);

    @Query(value = "SELECT s FROM TrackingVersion s WHERE s.code = :code" )
    TrackingVersion findByCode(@Param("code") String code);
}
