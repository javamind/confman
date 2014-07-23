package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Instance;

/**
 * {@link com.ninjamind.confman.domain.Instance}
 *
 * @author EHRET_G
 */
public class InstanceDto extends AbstractConfManDto {

    public InstanceDto() {
        super();
    }

    public InstanceDto(Instance object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public Instance toInstance() {
        return new Instance()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}
