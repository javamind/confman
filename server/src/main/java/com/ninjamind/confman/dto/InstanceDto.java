package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Instance;

/**
 * {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
public class InstanceDto extends AbstractConfManDto<InstanceDto, Instance> {
    private Long idApplication;
    private Long idEnvironment;
    public InstanceDto() {
        super();
    }

    public InstanceDto(Instance object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
        this.idApplication = object.getApplication().getId();
        this.idEnvironment = object.getEnvironment().getId();
    }

    public Instance toDo() {
        return new Instance()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setApplication(new Application().setId(idApplication))
                .setEnvironment(new Environment().setId(idEnvironment));
    }

    public InstanceDto setIdApplication(Long idApplication) {
        this.idApplication = idApplication;
        return this;
    }

    public InstanceDto setIdEnvironment(Long idEnvironment) {
        this.idEnvironment = idEnvironment;
        return this;
    }

    public Long getIdApplication() {
        return idApplication;
    }

    public Long getIdEnvironment() {
        return idEnvironment;
    }
}
