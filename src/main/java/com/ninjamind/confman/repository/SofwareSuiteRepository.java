package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.SoftwareSuite;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author ehret_g
 */
public interface SofwareSuiteRepository extends JpaRepository<SoftwareSuite, Long> {

}
