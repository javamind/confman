package com.ninjamind.confman.service;

import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterGroupment;
import com.ninjamind.confman.repository.ParameterGroupmentRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("parameterGroupmentFacade")
@Transactional
public class ParameterGroupmentFacadeImpl implements GenericFacade<ParameterGroupment, Long, ParameterGroupmentRepository> {
    @Autowired
    private ParameterGroupmentRepository parameterGroupmentRepository;

    @Override
    public ParameterGroupmentRepository getRepository() {
        return parameterGroupmentRepository;
    }

    @Override
    public Class<ParameterGroupment> getClassEntity() {
        return ParameterGroupment.class;
    }

    @Override
    public ParameterGroupment findByCode(ParameterGroupment entity) {
        return parameterGroupmentRepository.findByCode(entity.getCode());
    }
}
