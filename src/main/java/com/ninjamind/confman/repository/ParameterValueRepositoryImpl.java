package com.ninjamind.confman.repository;

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import org.hibernate.ScrollableResults;
import org.hibernate.criterion.CriteriaQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import java.util.List;

/**
 * Repository associé au {@link com.ninjamind.confman.domain.Application}
 *
 * @author ehret_g
 */
@Repository
public class ParameterValueRepositoryImpl implements ParameterValueRepository {

    @PersistenceContext
    private EntityManager em;

    public class SearchBuilder{
        private Long idAppliation;
        private Long idVersionTracking;
        private Long idParameter;
        private Long idInstance;
        private String code;

        public SearchBuilder setIdAppliation(Long idAppliation) {
            this.idAppliation = idAppliation;
            return this;
        }

        public SearchBuilder setIdVersionTracking(Long idVersionTracking) {
            this.idVersionTracking = idVersionTracking;
            return this;
        }

        public SearchBuilder setIdParameter(Long idParameter) {
            this.idParameter = idParameter;
            return this;
        }

        public SearchBuilder setIdInstance(Long idInstance) {
            this.idInstance = idInstance;
            return this;
        }

        public SearchBuilder setCode(String code) {
            this.code = code;
            return this;
        }
    }

    @Override
    public List<ParameterValue> findParameterValueByIdApp(PaginatedList list, ParameterValue criteria) {
        StringBuilder query = new StringBuilder("from parametervalue p where 1=1 ");

//        if(criteria!=null) {
//            if (!Strings.isNullOrEmpty(criteria.getLabel())) {
//                query.append("and p.label like '%:label%' ");
//            }
//            if(criteria.getApplication()!=null && criteria.getApplication().getId()!=null)
//            if (!Strings.isNullOrEmpty(criteria.getLabel())) {
//                query.append("and p.label=:label");
//            }
//        }
//
//        em.createQuery("").s
//        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
//
//        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
//        countQuery.f
//        countQuery.select(criteriaBuilder.count(countQuery.from(Foo.class)));
//        Long count = entityManager.createQuery(countQuery).getSingleResult();
//
//        CriteriaQuery<Foo> criteriaQuery = criteriaBuilder.createQuery(Foo.class);
//        Root<Foo> from = criteriaQuery.from(Foo.class);
//        CriteriaQuery<Foo> select = criteriaQuery.select(from);
//
//        TypedQuery<Foo> typedQuery = entityManager.createQuery(select);
//        while (pageNumber < count.intValue()) {
//            typedQuery.setFirstResult(pageNumber - 1);
//            typedQuery.setMaxResults(pageSize);
//            System.out.println("Current page: " + typedQuery.getResultList());
//            pageNumber += pageSize;
//        }
//        em.createQuery();
        return null;
    }


}