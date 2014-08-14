package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.TrackingVersion;

/**
 * {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author EHRET_G
 */
public class TrackingVersionDto extends AbstractConfManDto {

    public TrackingVersionDto() {
        super();
    }

    public TrackingVersionDto(TrackingVersion object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
    }

    public TrackingVersion toTrackingVersion() {
        return new TrackingVersion()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
