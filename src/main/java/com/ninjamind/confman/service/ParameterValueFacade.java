package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;

import java.io.Serializable;
import java.util.List;

/**
 * {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author EHRET_G
 */
public interface ParameterValueFacade<T, ID extends Serializable> extends GenericFacade<T, ID> {

    /**
     * Serach parameters values and return a paginated list
     * @param page
     * @param criteria
     * @return
     */
    PaginatedList<ParameterValue> filter(Integer page, ParameterValueSearchBuilder criteria);
}
