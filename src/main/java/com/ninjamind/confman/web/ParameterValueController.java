package com.ninjamind.confman.web;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.domain.PaginatedList;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.dto.InstanceDto;
import com.ninjamind.confman.dto.ParameterValueDto;
import com.ninjamind.confman.dto.ParameterValueFilterDto;
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
    private ParameterValueFacade parameterValueFacade;

    @Post("/parametervalue")
    public PaginatedList<ParameterValueDto> filter(ParameterValueFilterDto criteria) {
        Preconditions.checkNotNull(criteria);

        PaginatedList<ParameterValue> parameterValues =
                parameterValueFacade.filter(
                        criteria.getPage(),
                        criteria.toParameterValueSearchBuilder());

        //The DOs are transformed in DTOs
        return
                new PaginatedList<>(
                        Lists.transform(parameterValues, parameter -> new ParameterValueDto(parameter)))
                .setCompleteSize(parameterValues.getCompleteSize())
                .setCurrentPage(parameterValues.getCurrentPage())
                .setNbElementByPage(parameterValues.getNbElementByPage());
    }


}
