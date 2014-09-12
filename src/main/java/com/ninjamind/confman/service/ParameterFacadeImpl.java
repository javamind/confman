package com.ninjamind.confman.service;

import com.google.common.base.Objects;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterType;
import com.ninjamind.confman.exception.FoundException;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.ParameterRepository;
import net.codestory.http.errors.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Facade du manage {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
@Service("parameterFacade")
@Transactional
public class ParameterFacadeImpl implements ParameterFacade<Parameter, Long>{
    @Autowired
    private ParameterRepository parameterRepository;
    @Autowired
    private ApplicationtRepository applicationtRepository;

    @Override
    public JpaRepository<Parameter, Long> getRepository() {
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
            FoundException.foundIfNotNull(parameter);
            parameter = new Parameter().setCode(codeParam);
        }

        parameter.setLabel(labelParam) ;
        parameter.setType(type);

        parameterRepository.save(parameter);
    }

    @Override
    public Parameter findParameterApplication(String codeApp, String codeParam) {
        return parameterRepository.findByCode(codeApp, codeParam);
    }
}
