package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.VersionTracking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("versionTrackingFacade")
@Transactional
public class VersionTrackingFacadeImpl implements GenericFacade<VersionTracking, Long>{
    @Autowired
    private JpaRepository<VersionTracking, Long> versionTrackingRepository;

    @Override
    public JpaRepository<VersionTracking, Long> getRepository() {
        return versionTrackingRepository;
    }

    @Override
    public Class<VersionTracking> getClassEntity() {
        return VersionTracking.class;
    }

}
