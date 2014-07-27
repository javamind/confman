package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.repository.ApplicationtRepository;
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
@Service("applicationFacade")
@Transactional
public class ApplicationFacadeImpl implements ApplicationFacade<Application, Long>{
    @Autowired
    private ApplicationtRepository applicationRepository;

    @Override
    public JpaRepository<Application, Long> getRepository() {
        return applicationRepository;
    }

    @Override
    public Class<Application> getClassEntity() {
        return Application.class;
    }

    @Override
    public List<ApplicationVersion> findApplicationVersionByIdApp(Long id) {
        return applicationRepository.findApplicationVersionByIdApp(id);
    }

    @Override
    public List<Parameter> findParameterByIdApp(Long id) {
        return applicationRepository.findParameterByIdApp(id);
    }

    @Override
    public List<Instance> findInstanceByIdApp(Long id) {
        return applicationRepository.findInstanceByIdApp(id);
    }

    @Override
    public Application findOneWthDependencies(Long id) {
        return applicationRepository.findOneWthDependencies(id);
    }
}
