package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.SoftwareSuite;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author Guillaume EHRET
 */
public interface SofwareSuiteRepository extends JpaRepository<SoftwareSuite, Long> {

}
