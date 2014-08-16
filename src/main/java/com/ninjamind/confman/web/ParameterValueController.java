package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.dto.*;
import com.ninjamind.confman.service.GenericFacade;
import com.ninjamind.confman.service.ParameterValueFacade;
import net.codestory.http.annotations.Delete;
import net.codestory.http.annotations.Get;
import net.codestory.http.annotations.Post;
import net.codestory.http.annotations.Put;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.List;

/**
 * {@link }
 *
 * @author EHRET_G
 */
public class ParameterValueController {

    @Autowired
    @Qualifier("parameterValueFacade")
    private ParameterValueFacade<ParameterValue, Long> parameterValueFacade;

    @Post("/parametervalue/search")
    public PaginatedListDto<ParameterValueDto> search(ParameterValueFilterDto criteria) {
        Preconditions.checkNotNull(criteria);

        PaginatedList<ParameterValue> parameterValues =
                parameterValueFacade.filter(
                        criteria.getPage(),
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
    public ParameterValueDto update(ParameterValueDto parameter) {
        Preconditions.checkNotNull(parameter, "Object is required to update it");
        return new ParameterValueDto(parameterValueFacade.save(parameter.toParameterValue()));
    }

    @Post("/parametervalue")
    public List<ParameterValueDto> save(TrackingVersionDto trackingVersionDto) {
        Preconditions.checkNotNull(trackingVersionDto, "The version is required to create the value parameters");
        Preconditions.checkNotNull(trackingVersionDto.getId(), "The id version is required to create the value parameters");

        return  Lists.transform(parameterValueFacade.create(trackingVersionDto.getId()), parameterValue -> new ParameterValueDto(parameterValue));
    }

    @Delete("/parametervalue/:id")
    public void delete(Long id) {
        parameterValueFacade.delete(id);
    }
}

