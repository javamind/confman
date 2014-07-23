package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.SoftwareSuite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("softwareSuiteFacade")
@Transactional
public class SoftwareSuiteFacadeImpl implements GenericFacade<SoftwareSuite, Long>{
    @Autowired
    private JpaRepository<SoftwareSuite, Long> softwareSuiteRepository;

    @Override
    public JpaRepository<SoftwareSuite, Long> getRepository() {
        return softwareSuiteRepository;
    }

    @Override
    public Class<SoftwareSuite> getClassEntity() {
        return SoftwareSuite.class;
    }

}
