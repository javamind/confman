package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public interface SoftwareSuiteFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * @see com.ninjamind.confman.repository.SofwareSuiteEnvironmentRepository#findSoftwareSuiteEnvironmentByIdSoft(Long)
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