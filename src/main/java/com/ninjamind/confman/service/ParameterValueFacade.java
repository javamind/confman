package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;

import java.io.Serializable;
import java.util.List;

/**
 * {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
public interface ParameterValueFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {
    /**
     * Serach parameters values and return a paginated list
     * @param page
     * @param nbEltPerPage
     * @param criteria
     * @return
     */
    PaginatedList<ParameterValue> filter(Integer page, Integer nbEltPerPage, ParameterValueSearchBuilder criteria);

    /**
     * Find the last set of parameters for a version.
     * @param idVersion
     * @return
     */
    List<ParameterValue> create(Long idVersion);

    /**
     * Update a set of parameters
     * @param parameterValues
     * @return
     */
    void update(List<ParameterValue> parameterValues);

    /**
     * Find the parameter linked to this version
     * @param codeApp
     * @param codeVersion
     * @return
     * @throws com.ninjamind.confman.exception.VersionException
     */
    List<ParameterValue> findParamatersByCodeVersion(String codeApp,String codeVersion);

    /**
     * Find the parameter linked to this version
     * @param codeVersion
     * @param codeApp
     * @param env
     * @return
     * @throws com.ninjamind.confman.exception.VersionException, com.ninjamind.confman.exception.VersionTrackingException
     */
    List<ParameterValue> findParamatersByCodeVersionAndEnv(String codeApp, String codeVersion, String env);
}
