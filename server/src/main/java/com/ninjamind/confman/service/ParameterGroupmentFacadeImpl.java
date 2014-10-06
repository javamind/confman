package com.ninjamind.confman.service;

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
    public ParameterGroupment create(ParameterGroupment entity) {
        //We see if an entity exist
        ParameterGroupment parameterGroupment = parameterGroupmentRepository.findByCode(entity.getCode());
        if (parameterGroupment != null) {
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(entity, parameterGroupment, "id", "version");
            return parameterGroupment.setActive(true);
        }
        return getRepository().save(entity.setActive(true));
    }
}
