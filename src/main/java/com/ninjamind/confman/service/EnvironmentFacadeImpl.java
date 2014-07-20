package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.repository.HibernateUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ninjamind.confman.utils.LoggerFactory;

import java.util.List;
import java.util.logging.Logger;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("environmentFacade")
@Transactional
public class EnvironmentFacadeImpl implements GenericFacade<Environment, Long>{
    @Autowired
    private JpaRepository<Environment, Long> environmentRepository;

    @Override
    public JpaRepository<Environment, Long> getRepository() {
        return environmentRepository;
    }

    @Override
    public Class<Environment> getClassEntity() {
        return Environment.class;
    }

}
