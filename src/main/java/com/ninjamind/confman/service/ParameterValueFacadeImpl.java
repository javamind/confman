package com.ninjamind.confman.service;

import com.github.zafarkhaja.semver.Version;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.exception.VersionException;
import com.ninjamind.confman.exception.VersionTrackingException;
import com.ninjamind.confman.repository.*;
import com.ninjamind.confman.utils.LoggerFactory;
import net.codestory.http.errors.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * {@link ParameterValueFacade}
 *
 * @author Guillaume EHRET
 */
@Service("parameterValueFacade")
@Transactional
public class ParameterValueFacadeImpl implements ParameterValueFacade {
    private static Logger LOG = LoggerFactory.make();
    @Autowired
    TrackingVersionFacade trackingVersionFacade;
    @Autowired
    private ParameterValueRepository parameterValueRepository;
    @Autowired
    private TrackingVersionRepository trackingVersionRepository;
    @Autowired
    private ApplicationVersionRepository applicationVersionRepository;
    @Autowired
    private EnvironmentRepository environmentRepository;
    @Autowired
    private ParameterValueGenericRepository parameterValueRepositoryGeneric;

    @Override
    public ParameterValueGenericRepository getRepository() {
        return parameterValueRepositoryGeneric;
    }

    @Override
    public Class<ParameterValue> getClassEntity() {
        return ParameterValue.class;
    }

    @Override
    public PaginatedList<ParameterValue> filter(Integer page, Integer nbEltPerPage, ParameterValueSearchBuilder criteria) {
        //we instanciate our paginated list
        PaginatedList<ParameterValue> list =
                new PaginatedList<>()
                        .setCurrentPage(Objects.firstNonNull(page, 1))
                        .setNbElementByPage(Objects.firstNonNull(nbEltPerPage, PaginatedList.NB_DEFAULT));
        return parameterValueRepository.findByCriteria(list, criteria);
    }

    @Override
    public ParameterValue create(ParameterValue entity) {
        //We have'nt a functional unicity constraint
        return getRepository().save(entity.setActive(true));
    }

    @Override
    public List<ParameterValue> create(Long idVersion) {
        Preconditions.checkNotNull(idVersion);

        //We find the version in database
        ApplicationVersion version = applicationVersionRepository.getOne(idVersion);
        Application application = version.getApplication();

        //Snapshot ?
        if(version.getCode().toUpperCase().endsWith("SNAPSHOT")){
            return createParametersForSnapshot(version, application);
        }
        //or release ?
        return createParametersForRelease(version, application);
    }

    @Override
    public void update(List<ParameterValue> parameterValues) {
        Preconditions.checkNotNull(parameterValues);

        if (!parameterValues.isEmpty()) {
            //We read the version id in the first enreg
            TrackingVersion version = trackingVersionRepository.findOne(
                    parameterValues
                            .stream()
                            .findFirst()
                            .orElseThrow(NotFoundException::new)
                            .getTrackingVersion()
                            .getId()
            );

            //If the version is blocked ==> KO
            if (version.isBlocked()) {
                throw new VersionException("You can't modify a version if it's blocked");
            }
            //If not it's now blocked
            version.setBlocked(true);

            List<ParameterValue> parameterValuesInDb = parameterValueRepository.findByCriteria(
                    new PaginatedList<>().setNbElementByPage(PaginatedList.NB_MAX),
                    new ParameterValueSearchBuilder().setIdTrackingVersion(version.getId()));

            //If a parameter value linked to this version,  is not present in the list we have to delete it
            parameterValuesInDb
                    .stream()
                    .filter(p -> paramValueToDelete(parameterValues, p))
                    .forEach(p -> parameterValueRepositoryGeneric.delete(p));

            //Now we have to modify all the paramaters values
            parameterValues
                    .stream()
                    .forEach(p -> parameterValueRepositoryGeneric.save(parameterValueRepositoryGeneric.getOne(p.getId()).setLabel(p.getLabel())));
        }
    }

    /**
     * For a snapshot the version is not locked and all the values can change
     *
     * @param version
     * @param application
     * @return
     */
    @VisibleForTesting
    protected List<ParameterValue> createParametersForSnapshot(ApplicationVersion version, Application application) {
        Preconditions.checkNotNull(version);
        Preconditions.checkNotNull(application);

        //Load the last version tracking linked to this snapshot
        List<TrackingVersion> trackingVersions = trackingVersionRepository.findByIdAppVersion(version.getId());
        TrackingVersion trackingVersion = null;

        //A new tracking version is only create if no one is present for the app version
        if (trackingVersions == null || trackingVersions.isEmpty()) {
            trackingVersion = new TrackingVersion()
                    .setApplicationVersion(version)
                    //For a snapshot the tracking version is the same than the app version
                    .setCode(version.getCode())
                    .setActive(true)
                    .setLabel("Linked to version " + version.getCode());
        } else {
            //We keep the last
            trackingVersion = trackingVersions
                    .stream()
                    .max((o1, o2) -> o1.getId().compareTo(o2.getId()))
                    .get();
        }
        trackingVersion.setBlocked(false);
        trackingVersionRepository.save(trackingVersion);

        //For a snapshot the reference version is itself
        return createParametersValues(version, application, trackingVersion, Optional.of(trackingVersion));
    }

    /**
     * For a release each change is tracked
     *
     * @param version
     * @param application
     * @return
     */
    @VisibleForTesting
    protected List<ParameterValue> createParametersForRelease(ApplicationVersion version, Application application) {
        Preconditions.checkNotNull(version);
        Preconditions.checkNotNull(application);

        Optional<TrackingVersion> referenceTrackingVersion = Optional.empty();
        String newTrackingVersion = null;

        Preconditions.checkArgument(version != null, "idVersion not exist");
        List<TrackingVersion> trackingVersions = trackingVersionRepository.findByIdAppVersion(version.getId());

        if (trackingVersions == null || trackingVersions.isEmpty()) {
            //The version tracking is construct via the app version number
            newTrackingVersion = trackingVersionFacade.createTrackingVersion(version.getCode());

            List<ApplicationVersion> versions = applicationVersionRepository.findByIdApp(application.getId());
            referenceTrackingVersion = Optional.of(findLastTrackingVersionUsed(version, versions));
        } else {
            //The old version is keep to calculate the new parameters values
            referenceTrackingVersion = findLastTrackingVersion(trackingVersions);

            //The tracking version is construct with the version
            newTrackingVersion = trackingVersionFacade.incrementTrackingVersion(referenceTrackingVersion.orElseThrow(VersionException::new).getCode());
        }

        //create the tracking version
        TrackingVersion trackingVersion = new TrackingVersion()
                .setApplicationVersion(version)
                .setCode(newTrackingVersion)
                .setActive(true)
                .setBlocked(false)
                .setLabel("Linked to version " + version.getCode());

        trackingVersionRepository.save(trackingVersion);

        return createParametersValues(version, application, trackingVersion, referenceTrackingVersion);
    }


    @VisibleForTesting
    protected List<ParameterValue> createParametersValues(ApplicationVersion version, Application application, TrackingVersion trackingVersion, Optional<TrackingVersion> referenceTrackingVersion) {
        //If a reference tracking is find we search the param linked
        LOG.info("If a reference tracking is find we search the param linked for id tracking " + referenceTrackingVersion.orElse(null));
        Optional<List<ParameterValue>> parameterValuesRef =
                referenceTrackingVersion.map(ref -> parameterValueRepository.findByCriteria(
                        new PaginatedList<>().setNbElementByPage(PaginatedList.NB_MAX),
                        new ParameterValueSearchBuilder().setIdTrackingVersion(ref.getId())));

        int size = parameterValuesRef.orElse(new ArrayList<ParameterValue>()).size();
        LOG.info(String.format("... %d elements find ", size));
        List<ParameterValue> parameterValuesNew = new ArrayList<>(size);

        //An application can be used on several environments
        for (SoftwareSuiteEnvironment ssenv : application.getSoftwareSuite().getSoftwareSuiteEnvironments()) {
            Environment env = ssenv.getId().getEnvironment();

            //We create paramaters values associated to the application
            for (Parameter param : application.getParameters()) {

                //The parameter can be specific for an application
                if (ParameterType.APPLICATION.equals(param.getType())) {
                    parameterValuesNew
                            .add(
                                    createParameterValue(
                                            parameterValuesRef,
                                            trackingVersion,
                                            new ParameterValue()
                                                    .setCode(param.getCode())
                                                    .setParameter(param)
                                                    .setApplication(application)
                                                    .setEnvironment(env)
                                                    .setActive(true)
                                    )
                            );
                } else {
                    //or be defined for each instance
                    application
                            .getInstances()
                            .stream()
                            .filter(i -> env.getId().equals(i.getEnvironment().getId()))
                            .forEach(instance -> parameterValuesNew
                                    .add(
                                            createParameterValue(
                                                    parameterValuesRef,
                                                    trackingVersion,
                                                    new ParameterValue()
                                                            .setCode(param.getCode())
                                                            .setParameter(param)
                                                            .setApplication(application)
                                                            .setEnvironment(env)
                                                            .setInstance(instance)
                                                            .setActive(true)
                                            )
                                    ));
                }
            }
        }

        return parameterValuesNew;
    }
    /**
     * Create a new parameter value
     *
     * @param parameterValuesRef
     * @param trackingVersion
     * @param parameterValueTarget
     */
    @VisibleForTesting
    protected ParameterValue createParameterValue(Optional<List<ParameterValue>> parameterValuesRef,
                                                  TrackingVersion trackingVersion,
                                                  ParameterValue parameterValueTarget) {

        ParameterValue paramValueRef = null;
        if (parameterValuesRef.isPresent()) {
            paramValueRef = parameterValuesRef
                    .get()
                    .stream()
                    .filter(p -> p.compareWithOldTrackingVersion(parameterValueTarget))
                    .findFirst()
                    .orElse(null);
        }

        parameterValueTarget
                .setLabel(paramValueRef != null ? paramValueRef.getLabel() : null)
                .setOldvalue(paramValueRef != null ? paramValueRef.getLabel() : null)
                .setTrackingVersion(trackingVersion);

        return parameterValueRepositoryGeneric.save(parameterValueTarget);
    }

    /**
     * Read the list and return the last element
     *
     * @param trackingVersions
     * @return
     */
    @VisibleForTesting
    protected Optional<TrackingVersion> findLastTrackingVersion(List<TrackingVersion> trackingVersions) {
        Preconditions.checkNotNull(trackingVersions);
        return trackingVersions
                .stream()
                .max((c1, c2) -> Version.valueOf(c1.getCode()).compareTo(Version.valueOf(c2.getCode())));
    }


    /**
     * Find element in a list. We don't use the method {@link java.util.List#contains(Object)} because
     * the entity read on the screen don't have all the datas of the dependencies
     *
     * @param parameterValueDb
     * @param parameterValues
     * @return
     */
    @VisibleForTesting
    protected boolean paramValueToDelete(List<ParameterValue> parameterValues, ParameterValue parameterValueDb) {
        Preconditions.checkNotNull(parameterValues);
        Preconditions.checkNotNull(parameterValueDb);

        return !parameterValues
                .stream()
                .filter(p -> p.getId().equals(parameterValueDb.getId()))
                .findFirst()
                .isPresent();
    }

    /**
     * We need to find the last tracking version used before the actual version. It will be used like a reference
     * to create the new parameters values
     *
     * @param applicationVersion
     * @param versions
     */
    @VisibleForTesting
    protected TrackingVersion findLastTrackingVersionUsed(ApplicationVersion applicationVersion, List<ApplicationVersion> versions) {
        Preconditions.checkNotNull(versions);
        Preconditions.checkNotNull(applicationVersion);

        Optional<ApplicationVersion> previousVersion = versions.stream()
                //We exclude all the version greater or equal to the actual
                .filter(c -> Version.valueOf(applicationVersion.getCode()).greaterThan(Version.valueOf(c.getCode())))
                        //We keep the higher
                .max((c1, c2) -> Version.valueOf(c1.getCode()).compareTo(Version.valueOf(c2.getCode())));

        if (previousVersion.isPresent()) {
            //We search the max of the versions tracking
            List<TrackingVersion> trackingVersions = trackingVersionRepository.findByIdAppVersion(previousVersion.get().getId());
            if (trackingVersions != null && !trackingVersions.isEmpty()) {
                return findLastTrackingVersion(trackingVersions).get();
            }
            else {
                //recursively we try with the previous version
                return findLastTrackingVersionUsed(previousVersion.get(), versions);
            }
        }
        return null;
    }


    @Override
    public List<ParameterValue> findParamatersByCodeVersion(String codeApp, String codeVersion) {
        return findParameters(codeApp, codeVersion, null);
    }

    @Override
    public List<ParameterValue> findParamatersByCodeVersionAndEnv(String codeApp, String codeVersion, String env) {
        Preconditions.checkNotNull(env, "environnement is required");
        return findParameters(codeApp, codeVersion, env);
    }

    /***
     * Load the parameters value
     * @param codeVersion
     * @param env
     * @return
     */
    @VisibleForTesting
    protected List<ParameterValue> findParameters(String codeApp, String codeVersion, String env){
        Preconditions.checkNotNull(codeApp, "application is required");
        Preconditions.checkNotNull(codeVersion, "version is required");

        ApplicationVersion version = applicationVersionRepository.findByCode(codeApp, codeVersion);
        if(version==null){
            throw new VersionException(String.format("the version %s don't exist", codeVersion));
        }

        if(version.getTrackingVersions()==null || version.getTrackingVersions().isEmpty()){
            throw new VersionTrackingException(String.format("You have to create a tracking version in Confman for the app version %s", codeVersion));
        }

        //We keep the last tracking version if one exist
        ParameterValueSearchBuilder criteria = new ParameterValueSearchBuilder().setIdTrackingVersion(
                version.getTrackingVersions().stream().max((v1, v2) -> Long.compare(v1.getId(), v2.getId())).get().getId()
        );

        if(env!=null){
            Environment environment = environmentRepository.findByCode(env);
            if(environment==null){
                throw new VersionException(String.format("the environment %s don't exist", env));
            }
            criteria.setIdEnvironment(environment.getId());
        }

        return parameterValueRepository.findByCriteria(new PaginatedList<>().setNbElementByPage(PaginatedList.NB_MAX), criteria);
    }
}