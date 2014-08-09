package com.ninjamind.confman.service;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.ApplicationtVersionRepository;
import com.ninjamind.confman.repository.InstanceRepository;
import com.ninjamind.confman.repository.ParameterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("applicationFacade")
@Transactional
public class ApplicationFacadeImpl implements ApplicationFacade<Application, Long>{
    @Autowired
    private ApplicationtRepository applicationRepository;

    @Autowired
    private InstanceRepository instanceRepository;

    @Autowired
    private ParameterRepository parameterRepository;

    @Autowired
    private ApplicationtVersionRepository applicationtVersionRepository;

    @Autowired
    private JpaRepository<Environment, Long> environmentRepository;

    @Override
    public JpaRepository<Application, Long> getRepository() {
        return applicationRepository;
    }


    @Override
    public Class<Application> getClassEntity() {
        return Application.class;
    }

    @Override
    public List<ApplicationVersion> findApplicationVersionByIdApp(Long id) {
        return applicationtVersionRepository.findApplicationVersionByIdApp(id);
    }

    @Override
    public List<Parameter> findParameterByIdApp(Long id) {
        return parameterRepository.findParameterByIdApp(id);
    }

    @Override
    public List<Instance> findInstanceByIdApp(Long id) {
        return instanceRepository.findInstanceByIdApp(id);
    }

    @Override
    public Application findOneWthDependencies(Long id) {
        return applicationRepository.findOneWithDependencies(id);
    }

    @Override
    public Application save(Application app, List<Instance> instances, List<Parameter> parameters, List<ApplicationVersion> versions) {
        Preconditions.checkNotNull(app);

        if(app.getId()!=null && app.getId()>=0) {
            deleteDependenciesIfNecessary(findParameterByIdApp(app.getId()), parameters, parameterRepository);
            deleteDependenciesIfNecessary(findInstanceByIdApp(app.getId()), instances, instanceRepository);
            deleteDependenciesIfNecessary(findApplicationVersionByIdApp(app.getId()), versions, applicationtVersionRepository);
        }

        //We clear the dependencies
        app.clearInstances();
        app.clearApplicationVersion();
        app.clearParameters();
        final Application newapp = applicationRepository.save(app);

        //Depenencies are saved
        parameters.stream().forEach(p -> {
            p.setApplication(newapp);
            p.setParameterGroupment(null);
            parameterRepository.save(p);
        });
        instances.stream().forEach(i -> {
            i.setApplication(newapp);
            i.setEnvironment(environmentRepository.getOne(i.getEnvironment().getId()));
            instanceRepository.save(i);
        });
        versions.stream().forEach(v -> {
            v.setApplication(newapp);
            applicationtVersionRepository.save(v);
        });

        return findOneWthDependencies(newapp.getId());
    }

    /**
     * Delete dependencies
     * @param oldElements
     * @param newElements
     * @param repository
     * @param <T>
     */
    private <T extends AbstractConfManEntity> void deleteDependenciesIfNecessary(List<T> oldElements, List<T> newElements, JpaRepository<T, Long> repository) {
        //Maybe entities have to be deleted
        List<T> eltToDelete = oldElements.stream().filter(p -> {
            if (newElements != null && !newElements.isEmpty()) {
                for (T p1 : newElements) {
                    if (p.getId().equals(p1.getId())) {
                        return false;
                    }
                }
            }
            return true;
        }).collect(Collectors.toList());

        //if elt is no use we delete it
        eltToDelete.stream().forEach(elt -> {
            repository.delete(elt);
        });
    }
}
