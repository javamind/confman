package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterGroupment;
import com.ninjamind.confman.domain.ParameterType;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
public class ParameterDto extends AbstractConfManDto<ParameterDto, Parameter> {
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

    public Parameter toDo() {
        return new Parameter()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setApplication(new Application().setId(idApplication))
                .setParameterGroupment(new ParameterGroupment().setId(idParameterGroupment))
                .setType(Enum.valueOf(ParameterType.class, type));
    }

    public Long getIdApplication() {
        return idApplication;
    }

    public ParameterDto setIdApplication(Long idApplication) {
        this.idApplication = idApplication;
        return this;
    }

    public Long getIdParameterGroupment() {
        return idParameterGroupment;
    }

    public ParameterDto setIdParameterGroupment(Long idParameterGroupment) {
        this.idParameterGroupment = idParameterGroupment;
        return this;
    }

    public String getType() {
        return type;
    }

    public ParameterDto setType(String type) {
        this.type = type;
        return this;
    }
}
