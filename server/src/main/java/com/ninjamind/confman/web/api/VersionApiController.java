package com.ninjamind.confman.web.api;

import com.github.zafarkhaja.semver.Version;
import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.dto.ConfmanDto;
import com.ninjamind.confman.dto.VersionConfmanDto;
import com.ninjamind.confman.service.ApplicationVersionFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * This controller is the public API which can be use by script to read or add datas from confman. The
 * param are less restrictive than the controller GUI.
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/api/version")
public class VersionApiController {

    @Autowired
    private ApplicationVersionFacade applicationversionFacade;

    /**
     * Create a applicationversion in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @RequestMapping(method = RequestMethod.POST)
    public void addParam(@RequestBody VersionConfmanDto confmanDto) {
        saveparam(confmanDto, true);
    }

    /**
     * Save or update param
     * @param confmanDto
     * @param creation
     */
    private void saveparam(VersionConfmanDto confmanDto, boolean creation) {
        Preconditions.checkNotNull(confmanDto, "DTO ConfmanDto is required");
        Preconditions.checkNotNull(confmanDto.getCodeApplication(), "application code is required");
        Preconditions.checkNotNull(confmanDto.getCodeTrackingversion(), "version code is required");
        Preconditions.checkNotNull(confmanDto.getLabel(), "version label is required");

        applicationversionFacade.saveVersionToApplication(
                confmanDto.getCodeApplication(),
                confmanDto.getCodeTrackingversion(),
                confmanDto.getLabel(),
                creation);
    }

    /**
     * Update a applicationversion in Confman for an application
     * @param confmanDto dto which have to contain application code and param code and label
     */
    @RequestMapping(method = RequestMethod.PUT)
    public void updateParam(@RequestBody VersionConfmanDto confmanDto) {
        saveparam(confmanDto, false);
    }

    /**
     * Read a applicationversion
     * @param codeApp
     * @param version
     * @return
     */
    @RequestMapping(value = "/{version}/app/{codeApp}")
    public VersionConfmanDto getParam(@PathVariable String version, @PathVariable String codeApp) {
        Preconditions.checkNotNull(codeApp, "application code is required");
        Preconditions.checkNotNull(version, "applicationversion code is required");
        ApplicationVersion applicationversion = applicationversionFacade.getRepository().findByCode(codeApp, version);

        if(applicationversion==null){
            return null;
        }
        //we search the last version tracking
        Optional<TrackingVersion> maxTracking = applicationversion
                .getTrackingVersions().stream().max((a, b) -> Version.valueOf(a.getCode()).compareTo(Version.valueOf(b.getCode())));
        return new VersionConfmanDto()
                .setCode(applicationversion.getCode())
                .setLabel(applicationversion.getLabel())
                .setCodeTrackingversion(maxTracking.orElse(new TrackingVersion()).getCode())
                .setCodeApplication(applicationversion.getApplication().getCode())
                .setId(applicationversion.getId());
    }
}
