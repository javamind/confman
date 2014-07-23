package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.ApplicationVersion;
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
@Service("applicationVersionFacade")
@Transactional
public class ApplicationVersionFacadeImpl implements GenericFacade<ApplicationVersion, Long>{
    @Autowired
    private JpaRepository<ApplicationVersion, Long> applicationVersionRepository;

    @Override
    public JpaRepository<ApplicationVersion, Long> getRepository() {
        return applicationVersionRepository;
    }

    @Override
    public Class<ApplicationVersion> getClassEntity() {
        return ApplicationVersion.class;
    }

}
