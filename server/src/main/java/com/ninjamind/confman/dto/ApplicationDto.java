package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.*;

import java.util.List;
import java.util.stream.Collectors;

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
        this.idSoftwareSuite = object.getSoftwareSuite() !=null ? object.getSoftwareSuite().getId() : null;
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
        this.instances = instances.stream().map(instance -> new InstanceDto(instance)).collect(Collectors.toList());
        this.versions = versions.stream().map(version -> new ApplicationVersionDto(version)).collect(Collectors.toList());
        this.parameters = parameters.stream().map(parameter -> new ParameterDto(parameter)).collect(Collectors.toList());
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
        return this.instances==null ? null : this.instances.stream().map(instance -> instance.toDo()).collect(Collectors.toList());
    }

    public List<Parameter> toParameters() {
        return this.parameters==null ? null : this.parameters.stream().map(parameter -> parameter.toDo()).collect(Collectors.toList());
    }

    public List<ApplicationVersion> toApplicationVersions() {
        return this.versions==null ? null : this.versions.stream().map(version -> version.toDo()).collect(Collectors.toList());
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
