package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.ApplicationVersion;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author ehret_g
 */
public interface ApplicationtVersionRepository extends JpaRepository<ApplicationVersion, Long> {

}
