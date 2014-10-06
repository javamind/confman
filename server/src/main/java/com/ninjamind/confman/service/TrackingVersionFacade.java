package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.repository.TrackingVersionRepository;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public interface TrackingVersionFacade extends GenericFacade<TrackingVersion, Long, TrackingVersionRepository> {

    /**
     * This method build a valid tracking version from an application version number. The traking
     * version add a suffix to the application version
     * @param applicationVersion
     * @return
     */
    String createTrackingVersion(String applicationVersion);

    /**
     * Increment the tracking version number
     * @param trackingVersion
     * @return
     */
    String incrementTrackingVersion(String trackingVersion);
}
