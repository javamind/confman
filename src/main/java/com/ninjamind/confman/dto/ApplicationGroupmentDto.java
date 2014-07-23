package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.ApplicationGroupment;
import com.ninjamind.confman.domain.Environment;

/**
 * {@link com.ninjamind.confman.domain.Environment}
 *
 * @author EHRET_G
 */
public class ApplicationGroupmentDto extends AbstractConfManDto {

    public ApplicationGroupmentDto() {
        super();
    }

    public ApplicationGroupmentDto(ApplicationGroupment object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion()
        );
    }

    public ApplicationGroupment toApplicationGroupment() {
        return new ApplicationGroupment()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion());
    }
}
