package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

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
