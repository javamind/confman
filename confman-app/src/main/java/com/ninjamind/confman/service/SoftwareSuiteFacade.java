package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;
import com.ninjamind.confman.repository.SofwareSuiteRepository;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public interface SoftwareSuiteFacade extends GenericFacade<SoftwareSuite, Long, SofwareSuiteRepository> {

    /**
     * @see com.ninjamind.confman.repository.SofwareSuiteEnvironmentRepository#findByIdSoft(Long)
     * @param id
     * @return
     */
    List<SoftwareSuiteEnvironment> findSoftwareSuiteEnvironmentByIdSoft(Long id);

    /**
     * save software suite and list environment linked
     * @param softwareSuite
     * @param suiteEnvironmentSet
     * @return
     */
    SoftwareSuite update(SoftwareSuite softwareSuite, Set<SoftwareSuiteEnvironment> suiteEnvironmentSet);
}
