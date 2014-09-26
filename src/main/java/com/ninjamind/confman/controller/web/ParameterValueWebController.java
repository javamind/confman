package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.PaginatedListDto;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.dto.ParameterValueFilterDto;
import com.ninjamind.confman.service.ParameterValueFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Rest API for {@link com.ninjamind.confman.domain.ParameterValue}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/parametervalue")
public class ParameterValueWebController {

    @Autowired
    @Qualifier("parameterValueFacade")
    private ParameterValueFacade parameterValueFacade;

    @RequestMapping(value = "/search", method = RequestMethod.POST)
    public PaginatedListDto<ParameterValueDto> search(ParameterValueFilterDto criteria) {
        Preconditions.checkNotNull(criteria);

        PaginatedList<ParameterValue> parameterValues =
                parameterValueFacade.filter(
                        criteria.getPage(),
                        criteria.getNbEltPerPage(),
                        criteria.toParameterValueSearchBuilder());

        //The DOs are transformed in DTOs
        return
                new PaginatedListDto(
                        parameterValues.getCompleteSize(),
                        parameterValues.getCurrentPage(),
                        parameterValues.getNbElementByPage(),
                        Lists.transform(parameterValues, parameter -> new ParameterValueDto(parameter)));
    }

    @RequestMapping("/{id}")
    public ParameterValueDto get(@PathVariable Long id) {
        return new ParameterValueDto(parameterValueFacade.findOne(id));
    }

    @RequestMapping(method = RequestMethod.PUT)
    public void update(List<LinkedHashMap> parameters) {
        Preconditions.checkNotNull(parameters, "List is required to update it");
        parameterValueFacade.update(
                parameters
                        .stream()
                        .filter(p -> !(Boolean) p.get("toDelete"))
                        .map(p -> ParameterValueDto.toParameterValue(p))
                        .collect(Collectors.toList())
        );
    }

    @RequestMapping(method = RequestMethod.POST)
    public List<ParameterValueDto> save(Long idTrackingVersionDto) {
        Preconditions.checkNotNull(idTrackingVersionDto, "The id version is required to create the value parameters");

        return  Lists.transform(parameterValueFacade.create(idTrackingVersionDto), parameterValue -> new ParameterValueDto(parameterValue));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void delete(@PathVariable Long id) {
        parameterValueFacade.delete(id);
    }
}

