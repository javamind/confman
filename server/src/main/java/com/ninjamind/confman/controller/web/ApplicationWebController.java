package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.dto.ApplicationDto;
import com.ninjamind.confman.service.ApplicationFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/application")
public class ApplicationWebController extends AbstractConfmanWebController<Application, ApplicationDto, Long>{
    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public ApplicationWebController(ApplicationFacade genericFacade) {
        super(genericFacade, ApplicationDto.class, Application.class);
        this.applicationFacade=genericFacade;
    }

    @RequestMapping("/environment/{id}")
    public List<ApplicationDto> listByEnv(@PathVariable Long id) {
        return applicationFacade.findApplicationByIdEnv(id).stream().map(env -> new ApplicationDto(env)).collect(Collectors.toList());
    }

    @RequestMapping("/{id}")
    @Override
    public ApplicationDto get(@PathVariable Long id) {
        Application app = applicationFacade.findOneWthDependencies(id);
        return app!=null ? getApplicationDto(app) : new ApplicationDto();
    }

    @RequestMapping(method = RequestMethod.PUT)
    @Override
    public ResponseEntity<ApplicationDto> update(@RequestBody ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to update it");
        return new ResponseEntity(
                getApplicationDto(applicationFacade.save(app.toDo(), app.toInstances(), app.toParameters(), app.toApplicationVersions())),
                HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.POST)
    @Override
    public ResponseEntity<ApplicationDto> save(@RequestBody ApplicationDto app) {
        Preconditions.checkNotNull(app, "Object is required to save it");
        return new ResponseEntity(
                getApplicationDto(applicationFacade.save(app.toDo(), app.toInstances(), app.toParameters(), app.toApplicationVersions())),
                HttpStatus.CREATED);
    }

    private ApplicationDto getApplicationDto(Application app) {
        return new ApplicationDto(
                app,
                app.getApplicationVersions().stream().collect(Collectors.toList()),
                app.getInstances().stream().collect(Collectors.toList()),
                app.getParameters().stream().collect(Collectors.toList()));
    }

}
