package com.ninjamind.confman.controller.web;

import com.google.common.collect.Lists;
import com.ninjamind.confman.dto.TrackingVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Rest API for {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/trackingversion")
public class TrackingVersionWebController {

    @Autowired
    private ApplicationFacade applicationFacade;

    @RequestMapping("/application/{id}")
    public List<TrackingVersionDto> listTracking(@PathVariable Long id) {
        return Lists.transform(applicationFacade.findTrackingVersionByIdApp(id), instance -> new TrackingVersionDto(instance));
    }


}
