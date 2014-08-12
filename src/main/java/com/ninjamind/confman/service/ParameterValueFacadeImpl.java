package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.repository.ParameterValueRepository;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("parameterValueFacade")
@Transactional
public class ParameterValueFacadeImpl implements ParameterValueFacade<ParameterValue, Long>{
    @Autowired
    private ParameterValueRepository parameterValueRepository;

    @Autowired
    private JpaRepository<ParameterValue, Long> parameterValueRepositoryGeneric;

    @Override
    public JpaRepository<ParameterValue, Long> getRepository() {
        return parameterValueRepositoryGeneric;
    }

    @Override
    public Class<ParameterValue> getClassEntity() {
        return ParameterValue.class;
    }

    @Override
    public PaginatedList<ParameterValue> filter(Integer page, ParameterValueSearchBuilder criteria){
        //we instanciate our paginated list
        PaginatedList<ParameterValue> list = new PaginatedList<>().setCurrentPage(Objects.firstNonNull(page, 1));
        return parameterValueRepository.findParameterValue(list, criteria);
    }

}
