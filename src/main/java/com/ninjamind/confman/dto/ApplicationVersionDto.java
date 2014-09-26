package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.ApplicationVersion;

/**
 * {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author Guillaume EHRET
 */
public class ApplicationVersionDto extends AbstractConfManDto<ApplicationVersionDto, ApplicationVersion> {

    public ApplicationVersionDto() {
        super();
    }

    public ApplicationVersionDto(ApplicationVersion object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
    }

    public ApplicationVersion toDo() {
        return new ApplicationVersion()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
