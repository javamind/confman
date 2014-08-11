package com.ninjamind.confman.repository;

import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
public interface ParameterValueRepository extends Repository<ParameterValue, Long> {

    /**
     * Search the parameters values
     * @param list
     * @param criteria
     */
    public PaginatedList<ParameterValue> findParameterValue(PaginatedList<ParameterValue> list, SearchBuilder criteria);

}