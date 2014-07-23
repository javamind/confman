package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.VersionTracking;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.VersionTracking}
 *
 * @author ehret_g
 */
public interface VersionTrackingRepository extends JpaRepository<VersionTracking, Long> {

}
