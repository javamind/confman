package com.ninjamind.confman.controller.web;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.dto.TrackingVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import net.codestory.http.annotations.Get;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class TrackingVersionWebController {

    @Autowired
    private ApplicationFacade applicationFacade;

    @Get("/trackingversion/application/:id")
    public List<TrackingVersionDto> listTracking(Long id) {
        return Lists.transform(applicationFacade.findTrackingVersionByIdApp(id), instance -> new TrackingVersionDto(instance));
    }


}
