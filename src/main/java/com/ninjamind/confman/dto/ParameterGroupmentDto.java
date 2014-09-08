package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.ParameterGroupment;

/**
 * {@link com.ninjamind.confman.domain.ParameterGroupment}
 *
 * @author Guillaume EHRET
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
                object.getVersion(),
                object.isActive()
        );
    }

    public ParameterGroupment toParameterGroupment() {
        return new ParameterGroupment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
