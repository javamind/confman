package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author Guillaume EHRET
 */
public class SoftwareSuiteDto extends AbstractConfManDto {

    private List<SoftwareSuiteEnvironmentDto> environments;

    public SoftwareSuiteDto() {
        super();
    }

    public SoftwareSuiteDto(SoftwareSuite object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
    }

    public SoftwareSuite toSoftwareSuite() {
        return new SoftwareSuite()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }

    public Set<SoftwareSuiteEnvironment> toSoftwareSuiteEnvironment() {
        Set<SoftwareSuiteEnvironment> set = new HashSet<>();
        for(SoftwareSuiteEnvironmentDto dto : environments){
            set.add(dto.toSoftwareSuiteEnvironment());
        }
        return set;
    }

    public List<SoftwareSuiteEnvironmentDto> getEnvironments() {
        return environments;
    }

    public void setEnvironments(List<SoftwareSuiteEnvironmentDto> environments) {
        this.environments = environments;
    }
}
