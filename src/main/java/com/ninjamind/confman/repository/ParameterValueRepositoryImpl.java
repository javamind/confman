package com.ninjamind.confman.repository;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
@Repository
public class ParameterValueRepositoryImpl implements ParameterValueRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public PaginatedList<ParameterValue> findParameterValue(PaginatedList<ParameterValue> list, SearchBuilder criteria) {
        Preconditions.checkNotNull(list, "the list must be instanciated before the call");
        Preconditions.checkNotNull(criteria, "criteria is required");

        //On commence par trouver le nb max des enreg
        Long nbElements = (Long) criteria
                .populateQueryParam(em.createQuery("select count(p) ".concat(criteria.buildFromClause().concat(criteria.buildWhereClause()))))
                .getSingleResult();

        if(nbElements!=null && nbElements>0){
            list.setCompleteSize(nbElements.intValue());
            list.addAll(
                    criteria
                            .populateQueryParam(em.createQuery("select p ".concat(criteria.buildFromClause().concat(criteria.buildWhereClause()))))
                            .setFirstResult((list.getCurrentPage()-1) * list.getNbElementByPage())
                            .setMaxResults(list.getNbElementByPage())
                            .getResultList()
            );
        }

        return list;
    }

}