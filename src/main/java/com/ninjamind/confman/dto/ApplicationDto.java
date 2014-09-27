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
        this.idSoftwareSuite = object.getSoftwareSuite()==null ? null : object.getSoftwareSuite().getId();
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
        return this.instances==null ? null : Lists.transform(this.instances, instance -> instance.toDo());
    }

    public List<Parameter> toParameters() {
        return this.parameters==null ? null : Lists.transform(this.parameters, parameter -> parameter.toDo());
    }

    public List<ApplicationVersion> toApplicationVersions() {
        return this.versions==null ? null : Lists.transform(this.versions, version -> version.toDo());
    }

    public Long getIdSoftwareSuite() {
        return idSoftwareSuite;
    }

    public ApplicationDto setIdSoftwareSuite(Long idSoftwareSuite) {
        this.idSoftwareSuite = idSoftwareSuite;
        return this;
    }

    public List<ApplicationVersionDto> getVersions() {
        return versions;
    }

    public ApplicationDto setVersions(List<ApplicationVersionDto> versions) {
        this.versions = versions;
        return this;
    }

    public List<InstanceDto> getInstances() {
        return instances;
    }

    public ApplicationDto setInstances(List<InstanceDto> instances) {
        this.instances = instances;
        return this;
    }

    public List<ParameterDto> getParameters() {
        return parameters;
    }

    public ApplicationDto setParameters(List<ParameterDto> parameters) {
        this.parameters = parameters;
        return this;
    }


}
