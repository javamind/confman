package com.ninjamind.confman.service;

import com.github.zafarkhaja.semver.Version;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.repository.TrackingVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("trackingVersionFacade")
@Transactional
public class TrackingVersionFacadeImpl implements TrackingVersionFacade<TrackingVersion, Long> {
    @Autowired
    private JpaRepository<TrackingVersion, Long> trackingVersionRepository;

    @Override
    public JpaRepository<TrackingVersion, Long> getRepository() {
        return trackingVersionRepository;
    }

    @Override
    public Class<TrackingVersion> getClassEntity() {
        return TrackingVersion.class;
    }

    @Override
    public String createTrackingVersion(String applicationVersion) {
        Preconditions.checkNotNull(applicationVersion);

        //we use java-semserv to determine the next version number
        return Version.valueOf(applicationVersion).setPreReleaseVersion("track.1").toString();
    }

    @Override
    public String incrementTrackingVersion(String trackingVersion) {
        Preconditions.checkNotNull(trackingVersion);
        //we use java-semserv to determine the next version number
        return Version.valueOf(trackingVersion).incrementPreReleaseVersion().toString();
    }
}
