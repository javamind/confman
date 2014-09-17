package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.Instance;

/**
 * {@link com.ninjamind.confman.domain.Instance}
 *
 * @author Guillaume EHRET
 */
public class InstanceDto extends AbstractConfManDto {
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

    public Instance toInstance() {
        return new Instance()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setApplication(new Application().setId(idApplication))
                .setEnvironment(new Environment().setId(idEnvironment));
    }
}
