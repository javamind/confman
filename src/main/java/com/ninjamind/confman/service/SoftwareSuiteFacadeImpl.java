package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;
import com.ninjamind.confman.repository.SofwareSuiteEnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("softwareSuiteFacade")
@Transactional
public class SoftwareSuiteFacadeImpl implements SoftwareSuiteFacade<SoftwareSuite, Long>{
    @Autowired
    private JpaRepository<SoftwareSuite, Long> softwareSuiteRepository;

    @Autowired
    private SofwareSuiteEnvironmentRepository softwareSuiteEnvironmentRepository;

    @Override
    public JpaRepository<SoftwareSuite, Long> getRepository() {
        return softwareSuiteRepository;
    }

    @Override
    public Class<SoftwareSuite> getClassEntity() {
        return SoftwareSuite.class;
    }


    @Override
    public List<SoftwareSuiteEnvironment> findSoftwareSuiteEnvironmentByIdSoft(Long id) {
        return softwareSuiteEnvironmentRepository.findSoftwareSuiteEnvironmentByIdSoft(id);
    }
}
