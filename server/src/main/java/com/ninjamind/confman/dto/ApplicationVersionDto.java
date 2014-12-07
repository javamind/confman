package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.ApplicationVersion;

/**
 * {@link com.ninjamind.confman.domain.ApplicationVersion}
 *
 * @author Guillaume EHRET
 */
public class ApplicationVersionDto extends AbstractConfmanAppDto<ApplicationVersionDto, ApplicationVersion> {
    private Long idApplication;

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
        this.idApplication = object.getApplication().getId();
    }

    public ApplicationVersion toDo() {
        return new ApplicationVersion()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setApplication(new Application().setId(idApplication))
                .setActive(isActive());
    }

    public Long getIdApplication() {
        return idApplication;
    }

    public ApplicationVersionDto setIdApplication(Long idApplication) {
        this.idApplication = idApplication;
        return this;
    }
}
