package com.ninjamind.confman.service;

import com.github.zafarkhaja.semver.Version;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.exception.VersionException;
import com.ninjamind.confman.repository.ApplicationtVersionRepository;
import com.ninjamind.confman.repository.ParameterValueRepository;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;
import com.ninjamind.confman.repository.TrackingVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Service("parameterValueFacade")
@Transactional
public class ParameterValueFacadeImpl implements ParameterValueFacade<ParameterValue, Long> {
    @Autowired
    private ParameterValueRepository parameterValueRepository;

    @Autowired
    private TrackingVersionRepository trackingVersionRepository;

    @Autowired
    private ApplicationtVersionRepository applicationVersionRepository;

    @Autowired
    private JpaRepository<ParameterValue, Long> parameterValueRepositoryGeneric;

    @Autowired
    TrackingVersionFacade<TrackingVersion, Long> trackingVersionFacade;

    @Override
    public JpaRepository<ParameterValue, Long> getRepository() {
        return parameterValueRepositoryGeneric;
    }

    @Override
    public Class<ParameterValue> getClassEntity() {
        return ParameterValue.class;
    }

    @Override
    public PaginatedList<ParameterValue> filter(Integer page, ParameterValueSearchBuilder criteria) {
        //we instanciate our paginated list
        PaginatedList<ParameterValue> list = new PaginatedList<>().setCurrentPage(Objects.firstNonNull(page, 1));
        return parameterValueRepository.findParameterValue(list, criteria);
    }

    @Override
    public List<ParameterValue> getByIdAppVersion(Long idVersion) {
        Preconditions.checkNotNull(idVersion);

        TrackingVersion referenceTrackingVersion = null;
        String newTrackingVersion = null;

        //We find the version in database
        ApplicationVersion version = applicationVersionRepository.getOne(idVersion);
        Application application = version.getApplication();
        Preconditions.checkArgument(version != null, "idVersion not exist");
        List<TrackingVersion> trackingVersions = trackingVersionRepository.findTrackingVersionByIdAppVersion(version.getId());

        if (trackingVersions == null || trackingVersions.isEmpty()) {
            //The version tracking is construct via the app version number
            newTrackingVersion = trackingVersionFacade.createTrackingVersion(version.getCode());

            List<ApplicationVersion> versions = applicationVersionRepository.findApplicationVersionByIdApp(application.getId());
            referenceTrackingVersion = findLastTrackingVersionUsed(version, versions);
        }
        else {
            //The old version is keep to calculate the new parameters values
            referenceTrackingVersion = findLastTrackingVersion(trackingVersions).orElseThrow(VersionException::new);

            //The tracking version is construct with the version
            newTrackingVersion = trackingVersionFacade.incrementTrackingVersion(referenceTrackingVersion.getCode());
        }

        //create the tracking version
        TrackingVersion trackingVersion = new TrackingVersion()
                .setApplicationVersion(version)
                .setCode(newTrackingVersion)
                .setActive(true)
                .setLabel("Linked to version " + version.getCode());

        trackingVersionRepository.save(trackingVersion);


        //If a reference tracking is find we search the param linked
        List<ParameterValue> parameterValuesRef = referenceTrackingVersion == null ? new ArrayList<>() :
                parameterValueRepository.findParameterValue(
                        new PaginatedList<>().setNbElementByPage(99999),
                        new ParameterValueSearchBuilder().setIdTrackingVersion(referenceTrackingVersion.getId()));

        //An application can be used on several environments
        for(SoftwareSuiteEnvironment ssenv : application.getSoftwareSuite().getSoftwareSuiteEnvironments()){
            Environment env = ssenv.getId().getEnvironment();

            //We create all the values for all the paramaters atta
        };

        //Now we can find the last parameters linked to the application
//        for(application.
//        List<Parameter> parameterValuesNew = parameterValueRepository.findParameterValue(
//                new PaginatedList<>().setNbElementByPage(99999),
//                new ParameterValueSearchBuilder().setIdApplication(application.getId()));
//


        return null;
    }


    /**
     * Read the list and return the last element
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
     * We need to find the last tracking version used before the actual version. It will be used like a reference
     * to create the new parameters values
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

        if(previousVersion.isPresent()){
            //We search the max of the versions tracking
            List<TrackingVersion> trackingVersions = trackingVersionRepository.findTrackingVersionByIdAppVersion(previousVersion.get().getId());
            if(trackingVersions != null && !trackingVersions.isEmpty()) {
                return findLastTrackingVersion(trackingVersions).get();
            }
            else{
                //recursively we try with the previous version
                return findLastTrackingVersionUsed(previousVersion.get(), versions);
            }
        }
        return null;
    }

}