package com.ninjamind.confmanager.service;

import com.ninjamind.confmanager.domain.Environment;
import com.ninjamind.confmanager.repository.EnvironmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import utils.LoggerFactory;

import java.util.logging.Logger;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("environmentFacade")
@Transactional
public class EnvironmentFacadeImpl implements GenericFacade<Environment, Long>{
    private static Logger LOG = LoggerFactory.make();

    @Autowired
    private JpaRepository<Environment, Long> environmentRepository;

    @Override
    public JpaRepository<Environment, Long> getRepository() {
        return environmentRepository;
    }
}
