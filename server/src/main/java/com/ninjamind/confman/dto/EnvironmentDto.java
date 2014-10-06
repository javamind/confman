package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Environment;

/**
 * {@link com.ninjamind.confman.domain.Environment}
 *
 * @author Guillaume EHRET
 */
public class EnvironmentDto extends AbstractConfManDto<EnvironmentDto, Environment> {

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

    public Environment toDo() {
        return new Environment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
