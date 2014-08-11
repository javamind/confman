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
 * @author ehret_g
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
                .populateQueryParam(em.createQuery("select count(p) from ParameterValue p " + criteria.buildWhereClause()))
                .getSingleResult();

        if(nbElements!=null && nbElements>0){
            list.setCompleteSize(nbElements.intValue());
            list.addAll(
                    criteria.populateQueryParam(
                            em.createQuery("from ParameterValue p "
                                    .concat("left join fetch p.application ")
                                    .concat("left join fetch p.versionTracking ")
                                    .concat("left join fetch p.instance ")
                                    .concat(criteria.buildWhereClause()))
                    )
                    .setFirstResult((list.getCurrentPage()-1) * list.getNbElementByPage())
                    .setMaxResults(list.getNbElementByPage())
                    .getResultList()
            );
        }

        return list;
    }

}