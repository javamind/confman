package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Parameter;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author EHRET_G
 */
public class ParameterDto extends AbstractConfManDto {

    public ParameterDto() {
        super();
    }

    public ParameterDto(Parameter object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public Parameter toParameter() {
        return new Parameter()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}
