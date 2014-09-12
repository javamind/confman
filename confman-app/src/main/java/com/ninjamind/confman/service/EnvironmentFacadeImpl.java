package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.repository.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("environmentFacade")
@Transactional
public class EnvironmentFacadeImpl implements GenericFacade<Environment, Long>{
    @Autowired
    private EnvironmentRepository environmentRepository;

    @Override
    public JpaRepository<Environment, Long> getRepository() {
        return environmentRepository;
    }

    @Override
    public Class<Environment> getClassEntity() {
        return Environment.class;
    }



}
