package com.ninjamind.confman.controller.api;

import com.github.zafarkhaja.semver.Version;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.dto.ConfmanDto;
import com.ninjamind.confman.repository.ApplicationVersionRepository;
import com.ninjamind.confman.service.ApplicationVersionFacade;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
public class VersionApiController {

    @Autowired
    private ApplicationVersionFacade applicationversionFacade;

    /**
     * Create a applicationversion in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Post("/confman/version")
    public void addParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, true);
    }

    /**
     * Save or update param
     * @param confmanDto
     * @param creation
     */
    private void saveparam(ConfmanDto confmanDto, boolean creation) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getVersion(), "version code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "version label is required");

        applicationversionFacade.saveVersionToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getVersion(),
                confmanDto.getLabel(),
                creation);
    }

    /**
     * Update a applicationversion in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @Put("/confman/version")
    public void updateParam(ConfmanDto confmanDto) {
        saveparam(confmanDto, false);
    }

    /**
     * Read a applicationversion
     * @param codeApp
     * @param version
     * @return
     */
    @Get("/confman/version/:version/app/:codeApp")
    public ConfmanDto getParam(String version, String codeApp) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(version, "applicationversion code is required");
        ApplicationVersion applicationversion = applicationversionFacade.getRepository().findByCode(codeApp, version);

        if(applicationversion==null){
            return null;
        }
        //we search the last version tracking
        Optional<TrackingVersion> maxTracking = applicationversion
                .getTrackingVersions().stream().max((a, b) -> Version.valueOf(a.getCode()).compareTo(Version.valueOf(b.getCode())));
        return new ConfmanDto()
                .setCode(applicationversion.getCode())
                .setLabel(applicationversion.getLabel())
                .setVersion(maxTracking.orElse(new TrackingVersion()).getCode())
                .setCodeApplication(applicationversion.getApplication().getCode())
                .setId(applicationversion.getId());
    }
}
