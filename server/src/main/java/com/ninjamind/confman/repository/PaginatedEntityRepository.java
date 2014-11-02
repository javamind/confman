package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.data.repository.Repository;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public interface PaginatedEntityRepository<T, ID> {

    /**
     * Search the parameters values
     * @param list
     * @param criteria
     */
    public PaginatedList<T> findParamsByCriteria(PaginatedList<T> list, SearchBuilder criteria);

}