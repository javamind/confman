package com.ninjamind.confman.service;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.repository.ApplicationtRepository;
import com.ninjamind.confman.repository.SofwareSuiteRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("applicationFacade")
@Transactional
public class ApplicationFacadeImpl implements ApplicationFacade {
    @Autowired
    private ApplicationtRepository applicationRepository;

    @Autowired
    private SofwareSuiteRepository sofwareSuiteRepository;

    @Autowired
    private InstanceFacade instanceFacade;

    @Autowired
    private ParameterFacade parameterFacade;

    @Autowired
    private TrackingVersionFacade trackingVersionFacade;

    @Autowired
    private ApplicationVersionFacade applicationVersionFacade;

    @Autowired
    private EnvironmentFacade environmentFacade;

    @Override
    public ApplicationtRepository getRepository() {
        return applicationRepository;
    }


    @Override
    public Class<Application> getClassEntity() {
        return Application.class;
    }

    @Override
    public Application findByCode(Application entity) {
        return applicationRepository.findByCode(entity.getCode());
    }

    @Override
    public List<Application> findApplicationByIdEnv(Long id) {
        return applicationRepository.findByIdEnv(id);
    }

    @Override
    public List<ApplicationVersion> findApplicationVersionByIdApp(Long id) {
        return applicationVersionFacade.getRepository().findByIdApp(id);
    }

    @Override
    public List<TrackingVersion> findTrackingVersionByIdApp(Long id) {
        return trackingVersionFacade.getRepository().findByIdApp(id);
    }

    @Override
    public List<Environment> findEnvironmentByIdApp(Long id) {
        return environmentFacade.getRepository().findByIdApp(id);
    }

    @Override
    public List<Parameter> findParameterByIdApp(Long id) {
        return parameterFacade.getRepository().findByIdApp(id);
    }

    @Override
    public List<Instance> findInstanceByIdAppOrEnv(Long idApp, Long idEnv) {
        if(idApp==null && idEnv==null){
            return instanceFacade.getRepository().findAll();
        }
        if(idApp!=null && idEnv!=null){
            return instanceFacade.getRepository().findByIdappAndEnv(idApp, idEnv);
        }
        if(idApp!=null){
            return instanceFacade.getRepository().findByIdApp(idApp);
        }
        return instanceFacade.getRepository().findByIdEnv(idEnv);
    }

    @Override
    public Application findOneWthDependencies(Long id) {
        return applicationRepository.findOneWithDependencies(id);
    }

    @Override
    public Application save(Application app, List<Instance> instances, List<Parameter> parameters, List<ApplicationVersion> versions) {
        Preconditions.checkNotNull(app);

        //We see if an entity exist
        Application application = applicationRepository.findByCode(app.getCode());

        if(application!=null){
            deleteDependenciesIfNecessary(findParameterByIdApp(app.getId()), parameters, parameterFacade.getRepository());
            deleteDependenciesIfNecessary(findInstanceByIdAppOrEnv(app.getId(), null), instances, instanceFacade.getRepository());
            deleteDependenciesIfNecessary(findApplicationVersionByIdApp(app.getId()), versions, applicationVersionFacade.getRepository());
            //All the proprieties are copied except the version number
            BeanUtils.copyProperties(app, application, "id", "version");
        }
        else{
            //If not we create one application
            application = create(app);
        }
        final Application newapp = application;

        //We clear the dependencies
        application.clearInstances();
        application.clearApplicationVersion();
        application.clearParameters();
        application.setSoftwareSuite(app.getSoftwareSuite().getId()==null ? null : sofwareSuiteRepository.getOne(app.getSoftwareSuite().getId()));

        //Depenencies are saved
        if(parameters!=null){
            parameters.stream().forEach(p -> {
                p.setApplication(newapp);
                p.setParameterGroupment(null);
                if (p.getId() != null) {
                    parameterFacade.update(p);
                } else {
                    parameterFacade.create(p);
                }
            });
        }
        if(instances!=null){
            instances.stream().forEach(i -> {
                i.setApplication(newapp);
                i.setEnvironment(environmentFacade.getRepository().getOne(i.getEnvironment().getId()));
                if (i.getId() != null) {
                    instanceFacade.update(i);
                } else {
                    instanceFacade.create(i);
                }
            });
        }
        if(versions!=null) {
            versions.stream().forEach(v -> {
                v.setApplication(newapp);
                if (v.getId() != null) {
                    applicationVersionFacade.update(v);
                } else {
                    applicationVersionFacade.create(v);
                }
            });
        }
        return findOneWthDependencies(application.getId());
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
            elt.setActive(false);
        });
    }
}
