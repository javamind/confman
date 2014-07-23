package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.VersionTracking;

/**
 * {@link com.ninjamind.confman.domain.VersionTracking}
 *
 * @author EHRET_G
 */
public class VersionTrackingDto extends AbstractConfManDto {

    public VersionTrackingDto() {
        super();
    }

    public VersionTrackingDto(VersionTracking object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public VersionTracking toVersionTracking() {
        return new VersionTracking()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}
