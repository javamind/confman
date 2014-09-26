package com.ninjamind.confman.dto;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.*;

import java.util.List;

/**
 * {@link com.ninjamind.confman.domain.Application}
 *
 * @author Guillaume EHRET
 */
public class ApplicationDto extends AbstractConfManDto<ApplicationDto, Application> {
    private Long idSoftwareSuite;
    private List<ApplicationVersionDto> versions;
    private List<InstanceDto> instances;
    private List<ParameterDto> parameters;

    public ApplicationDto() {
        super();
    }

    public ApplicationDto(Application object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
    }

    public ApplicationDto(Application object, List<ApplicationVersion> versions, List<Instance> instances, List<Parameter> parameters) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
        this.idSoftwareSuite = object.getSoftwareSuite().getId();
        this.instances = Lists.transform(instances, instance -> new InstanceDto(instance));
        this.versions = Lists.transform(versions, version -> new ApplicationVersionDto(version));
        this.parameters = Lists.transform(parameters, parameter -> new ParameterDto(parameter));
    }


    public Application toDo() {
        return new Application()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setSoftwareSuite(new SoftwareSuite().setId(idSoftwareSuite))
                .setVersion(getVersion())
                .setActive(isActive());
    }

    public List<Instance> toInstances() {
        return Lists.transform(this.instances, instance -> instance.toDo());
    }

    public List<Parameter> toParameters() {
        return Lists.transform(this.parameters, parameter -> parameter.toDo());
    }

    public List<ApplicationVersion> toApplicationVersions() {
        return Lists.transform(this.versions, version -> version.toDo());
    }


}
