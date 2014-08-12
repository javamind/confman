package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.*;

import java.io.Serializable;
import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public interface ApplicationFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * @see com.ninjamind.confman.repository.ApplicationtRepository#findApplicationByIdEnv(Long)
     * @param id
     * @return
     */
    List<Application> findApplicationByIdEnv(Long id);

    /**
     * @see com.ninjamind.confman.repository.ApplicationtVersionRepository#findApplicationVersionByIdApp(Long)
     * @param id
     * @return
     */
    List<ApplicationVersion> findApplicationVersionByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.VersionTrackingRepository#findVersionTrackingByIdApp(Long) }
     * @param id
     * @return
     */
    List<VersionTracking> findVersionTrackingByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.ParameterRepository#findParameterByIdApp(Long)
     * @param id
     * @return
     */
    List<Parameter> findParameterByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.InstanceRepository#findInstanceByIdApp(Long)
     * @param idApp
     * @param idEnv
     * @return
     */
    List<Instance> findInstanceByIdAppOrEnv( Long idApp, Long idEnv);

    /**
     * @see com.ninjamind.confman.repository.ApplicationtRepository#findOneWithDependencies(Long)
     * @param id
     * @return
     */
    Application findOneWthDependencies(Long id);

    /**
     * Save one applicaton and his dependencies
     * @param app
     * @param parameters
     * @param versions
     * @return
     */
    Application save(Application app, List<Instance> instances, List<Parameter> parameters, List<ApplicationVersion> versions);
}
