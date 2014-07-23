package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("applicationFacade")
@Transactional
public class ApplicationFacadeImpl implements GenericFacade<Application, Long>{
    @Autowired
    private JpaRepository<Application, Long> applicationRepository;

    @Override
    public JpaRepository<Application, Long> getRepository() {
        return applicationRepository;
    }

    @Override
    public Class<Application> getClassEntity() {
        return Application.class;
    }

}
