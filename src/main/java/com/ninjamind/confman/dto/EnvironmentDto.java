package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Environment;

/**
 * {@link com.ninjamind.confman.domain.Environment}
 *
 * @author EHRET_G
 */
public class EnvironmentDto extends AbstractConfManDto {

    public EnvironmentDto() {
        super();
    }

    public EnvironmentDto(Environment environment) {
        super(
                environment.getId(),
                environment.getCode(),
                environment.getLabel(),
                environment.getVersion(),
                environment.isActive()
        );
    }

    public Environment toEnvironment() {
        return new Environment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
