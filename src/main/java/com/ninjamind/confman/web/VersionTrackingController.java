package com.ninjamind.confman.web;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.dto.VersionTrackingDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Get;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class VersionTrackingController {

    @Autowired
    private ApplicationFacade<Application, Long> applicationFacade;

    @Get("/versiontracking/application/:id")
    public List<VersionTrackingDto> listTracking(Long id) {
        return Lists.transform(applicationFacade.findVersionTrackingByIdApp(id), instance -> new VersionTrackingDto(instance));
    }


}
