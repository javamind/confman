package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.exception.FoundException;
import com.ninjamind.confman.exception.NotFoundException;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.ParameterRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Facade du manage {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
@Service("parameterFacade")
@Transactional
public class ParameterFacadeImpl implements ParameterFacade {
    @Autowired
    private ParameterRepository parameterRepository;

    @Autowired
    private ApplicationtRepository applicationtRepository;

    @Override
    public ParameterRepository getRepository() {
        return parameterRepository;
    }

    @Override
    public Class<Parameter> getClassEntity() {
        return Parameter.class;
    }


    @Override
    public void saveParameterToApplication(String codeApp, String codeParam, String labelParam, String typeParam, boolean creation) {
        //Is the application exist? If not it's an error
        Application application = NotFoundException.notFoundIfNull(applicationtRepository.findByCode(codeApp));

        //We see if the param is an application or an instance param
        ParameterType type = Objects.firstNonNull(ParameterType.valueOf(typeParam), ParameterType.APPLICATION);

        //Is the parameter exist ?
        Parameter parameter = parameterRepository.findByCode(codeApp, codeParam);

        if(creation){
            //If we want to create a new one we throw an exception if parameter exist
            FoundException.foundExceptionIfNotNullAndActive(parameter);
            parameter = new Parameter().setCode(codeParam).setApplication(application);
        }

        parameter.setLabel(labelParam) ;
        parameter.setType(type);

        if (creation) {
            create(parameter);
        } else {
            update(parameter);
        }
        parameterRepository.save(parameter);
    }

    @Override
    public Parameter findByCode(Parameter entity) {
        return parameterRepository.findByCode(entity.getApplication().getCode(), entity.getCode());
    }
}
