package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.data.repository.Repository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public interface ParameterValueRepository extends Repository<ParameterValue, Long> {

    /**
     * Search the parameters values
     * @param list
     * @param criteria
     */
    public PaginatedList<ParameterValue> findByCriteria(PaginatedList<ParameterValue> list, SearchBuilder criteria);

}