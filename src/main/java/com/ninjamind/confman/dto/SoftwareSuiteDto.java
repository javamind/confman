package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.SoftwareSuite;

/**
 * {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author EHRET_G
 */
public class SoftwareSuiteDto extends AbstractConfManDto {

    public SoftwareSuiteDto() {
        super();
    }

    public SoftwareSuiteDto(SoftwareSuite object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public SoftwareSuite toSoftwareSuite() {
        return new SoftwareSuite()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}
