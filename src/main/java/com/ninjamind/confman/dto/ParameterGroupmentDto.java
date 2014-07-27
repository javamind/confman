package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.ParameterGroupment;

/**
 * {@link com.ninjamind.confman.domain.ParameterGroupment}
 *
 * @author EHRET_G
 */
public class ParameterGroupmentDto extends AbstractConfManDto {

    public ParameterGroupmentDto() {
        super();
    }

    public ParameterGroupmentDto(ParameterGroupment object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public ParameterGroupment toParameterGroupment() {
        return new ParameterGroupment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}