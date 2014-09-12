package com.ninjamind.confman.service;

import java.io.Serializable;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public interface TrackingVersionFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

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
