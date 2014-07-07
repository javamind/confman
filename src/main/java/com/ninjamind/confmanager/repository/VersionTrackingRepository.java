package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.VersionTracking;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.VersionTracking}
 *
 * @author ehret_g
 */
public interface VersionTrackingRepository extends JpaRepository<VersionTracking, Long> {

}
