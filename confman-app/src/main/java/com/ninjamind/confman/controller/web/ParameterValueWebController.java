package com.ninjamind.confman.controller.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.*;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import net.codestory.http.payload.Payload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * {@link }
 *
 * @author Guillaume EHRET
 */
public class ParameterValueWebController {

    @Autowired
    @Qualifier("parameterValueFacade")
    private ParameterValueFacade<ParameterValue, Long> parameterValueFacade;

    @Post("/parametervalue/search")
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

    @Get("/parametervalue/:id")
    public ParameterValueDto get(Long id) {
        return new ParameterValueDto(parameterValueFacade.findOne(id));
    }

    @Put("/parametervalue")
    public Payload update(List<LinkedHashMap> parameters) {
        Preconditions.checkNotNull(parameters, "List is required to update it");
        parameterValueFacade.update(
                parameters
                        .stream()
                        .filter(p -> !(Boolean) p.get("toDelete"))
                        .map(p -> ParameterValueDto.toParameterValue(p))
                        .collect(Collectors.toList())
        );
        return Payload.created();
    }

    @Post("/parametervalue")
    public List<ParameterValueDto> save(Long idTrackingVersionDto) {
        Preconditions.checkNotNull(idTrackingVersionDto, "The id version is required to create the value parameters");

        return  Lists.transform(parameterValueFacade.create(idTrackingVersionDto), parameterValue -> new ParameterValueDto(parameterValue));
    }

    @Delete("/parametervalue/:id")
    public void delete(Long id) {
        parameterValueFacade.delete(id);
    }
}

