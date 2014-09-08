package com.ninjamind.confman.service;

import com.github.zafarkhaja.semver.GrammarException;
import com.github.zafarkhaja.semver.Version;
import com.github.zafarkhaja.semver.util.UnexpectedElementTypeException;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Objects;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.exception.VersionException;
import com.ninjamind.confman.exception.VersionTrackingException;
import com.ninjamind.confman.repository.ApplicationtVersionRepository;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;
import net.codestory.http.annotations.Get;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
@Service("applicationVersionFacade")
@Transactional
public class ApplicationVersionFacadeImpl implements ApplicationVersionFacade<ApplicationVersion, Long>{
    @Autowired
    private ApplicationtVersionRepository applicationVersionRepository;

    @Override
    public JpaRepository<ApplicationVersion, Long> getRepository() {
        return applicationVersionRepository;
    }

    @Override
    public Class<ApplicationVersion> getClassEntity() {
        return ApplicationVersion.class;
    }

    @Override
    public boolean checkVersionNumber(String number) {
        try{
            Version.valueOf(number);
            return true;
        }
        catch (NullPointerException | UnexpectedElementTypeException | GrammarException e){
            return false;
        }
    }





}
