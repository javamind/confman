package com.ninjamind.confman.service;

import com.google.common.collect.Sets;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;
import com.ninjamind.confman.repository.SofwareSuiteEnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
    private JpaRepository<Environment, Long> environmentRepository;

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

    @Override
    public SoftwareSuite update(SoftwareSuite softwareSuite, Set<SoftwareSuiteEnvironment> suiteEnvironmentSet) {
        //we delete all the linked
        softwareSuiteEnvironmentRepository.delete(findSoftwareSuiteEnvironmentByIdSoft(softwareSuite.getId()));

        if(suiteEnvironmentSet!=null && !suiteEnvironmentSet.isEmpty()) {
            //Attach the objects to the session
            for(SoftwareSuiteEnvironment softwareSuiteEnvironment : suiteEnvironmentSet){
                softwareSuiteEnvironmentRepository.save(
                        new SoftwareSuiteEnvironment(
                                softwareSuiteRepository.findOne(softwareSuiteEnvironment.getId().getSoftwareSuite().getId()),
                                environmentRepository.findOne(softwareSuiteEnvironment.getId().getEnvironment().getId())
                ));
            }
        }
        return save(softwareSuite);
    }


}
