package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.SoftwareSuite;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author Guillaume EHRET
 */
public interface SofwareSuiteRepository extends ConfmanRepository<SoftwareSuite, Long> {

    SoftwareSuite findByCode(String code);
}
