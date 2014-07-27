package com.ninjamind.confman.dto;

import com.google.common.collect.Lists;
import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.ApplicationVersion;
import com.ninjamind.confman.domain.Instance;
import com.ninjamind.confman.domain.Parameter;

import java.util.List;

/**
 * {@link com.ninjamind.confman.domain.Application}
 *
 * @author EHRET_G
 */
public class ApplicationDto extends AbstractConfManDto {

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
                object.getVersion()
        );
    }

    public ApplicationDto(Application object, List<ApplicationVersion> versions, List<Instance> instances, List<Parameter> parameters) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
        this.instances = Lists.transform(instances, instance -> new InstanceDto(instance));
        this.versions = Lists.transform(versions, version -> new ApplicationVersionDto(version));
        this.parameters = Lists.transform(parameters, parameter -> new ParameterDto(parameter));
    }


    public Application toApplication() {
        return new Application()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }

    public List<Instance> toInstances() {
        return Lists.transform(this.instances, instance -> instance.toInstance());
    }

    public List<Parameter> toParameters() {
        return Lists.transform(this.parameters, parameter -> parameter.toParameter());
    }

    public List<ApplicationVersion> toApplicationVersions() {
        return Lists.transform(this.versions, version -> version.toApplicationVersion());
    }
}
