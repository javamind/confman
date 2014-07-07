package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.domain.ApplicationVersion;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confmanager.domain.ApplicationVersion}
 *
 * @author ehret_g
 */
public interface ApplicationVersionRepository extends JpaRepository<ApplicationVersion, Long> {

}
