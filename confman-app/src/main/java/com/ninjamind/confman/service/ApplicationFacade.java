package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.*;

import java.io.Serializable;
import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public interface ApplicationFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * @see com.ninjamind.confman.repository.ApplicationtRepository#findByIdEnv(Long)
     * @param id
     * @return
     */
    List<Application> findApplicationByIdEnv(Long id);

    /**
     * @see com.ninjamind.confman.repository.ApplicationtVersionRepository#findByIdApp(Long)
     * @param id
     * @return
     */
    List<ApplicationVersion> findApplicationVersionByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.TrackingVersionRepository#findByIdApp(Long) }
     * @param id
     * @return
     */
    List<TrackingVersion> findTrackingVersionByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.EnvironmentRepository#findByIdApp(Long)  }
     * @param id
     * @return
     */
    List<Environment> findEnvironmentByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.ParameterRepository#findByIdApp(Long)
     * @param id
     * @return
     */
    List<Parameter> findParameterByIdApp( Long id);

    /**
     * @see com.ninjamind.confman.repository.InstanceRepository#findByIdApp(Long)
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
