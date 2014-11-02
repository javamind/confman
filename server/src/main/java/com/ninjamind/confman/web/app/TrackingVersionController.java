package com.ninjamind.confman.web.app;

import com.ninjamind.confman.dto.TrackingVersionDto;
import com.ninjamind.confman.service.ApplicationFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/app/trackingversion")
public class TrackingVersionController {

    @Autowired
    private ApplicationFacade applicationFacade;

    @RequestMapping("/application/{id}")
    public List<TrackingVersionDto> listTracking(@PathVariable Long id) {
        return applicationFacade.findTrackingVersionByIdApp(id).stream().map(instance -> new TrackingVersionDto(instance)).collect(Collectors.toList());
    }


}
