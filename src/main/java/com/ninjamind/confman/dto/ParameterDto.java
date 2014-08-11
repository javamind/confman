package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterGroupment;
import com.ninjamind.confman.domain.ParameterType;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author EHRET_G
 */
public class ParameterDto extends AbstractConfManDto {
    private Long idApplication;
    private Long idParameterGroupment;
    private String type;
    public ParameterDto() {
        super();
    }

    public ParameterDto(Parameter object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion() ,
                object.isActive()
        );
        this.idApplication = object.getApplication().getId();
        this.idParameterGroupment = object.getParameterGroupment() != null ? object.getParameterGroupment().getId() : null;
        this.type = object.getType().name();
    }

    public Parameter toParameter() {
        return new Parameter()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setApplication(new Application().setId(idApplication))
                .setParameterGroupment(new ParameterGroupment().setId(idParameterGroupment))
                .setType(ParameterType.valueOf(type));
    }
}
