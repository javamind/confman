package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Application;
import com.ninjamind.confman.domain.Parameter;
import com.ninjamind.confman.domain.ParameterValue;
import com.ninjamind.confman.domain.TrackingVersion;
import com.ninjamind.confman.repository.ParameterValueSearchBuilder;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author EHRET_G
 */
public class ParameterValueFilterDto extends ParameterValueDto {
    private Integer page;

    public ParameterValueFilterDto() {
        super();
    }

    public ParameterValueSearchBuilder toParameterValueSearchBuilder() {
        return new ParameterValueSearchBuilder()
                .setCode(getCode())
                .setIdApplication(idApplication)
                .setIdInstance(idInstance)
                .setIdParameter(idParameter)
                .setIdEnvironment(idEnvironment)
                .setIdTrackingVersion(idTrackingVersion);
    }

    public Integer getPage() {
        return page;
    }
}
