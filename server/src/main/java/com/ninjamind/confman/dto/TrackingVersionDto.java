package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.TrackingVersion;

/**
 * {@link com.ninjamind.confman.domain.TrackingVersion}
 *
 * @author Guillaume EHRET
 */
public class TrackingVersionDto extends AbstractConfManDto<TrackingVersionDto, TrackingVersion> {

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

    public TrackingVersion toDo() {
        return new TrackingVersion()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive());
    }
}
