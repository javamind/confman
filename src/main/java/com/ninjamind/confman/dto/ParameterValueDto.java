package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.*;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author EHRET_G
 */
public class ParameterValueDto extends AbstractConfManDto {
    private String value;
    private Long idVersionTracking;
    private String codeVersionTracking;
    private Long idApplication;
    private String codeApplication;
    private Long idParameter;
    private Long idInstance;
    private String codeInstance;


    public ParameterValueDto() {
        super();
    }

    public ParameterValueDto(ParameterValue object) {
        super(
                object.getId(),
                object.getCode(),
                object.getLabel(),
                object.getVersion(),
                object.isActive()
        );
        this.value = object.getValue();
        this.idApplication = object.getApplication().getId();
        this.codeApplication = object.getApplication().getCode();
        this.idParameter = object.getParameter().getId();
        this.idVersionTracking = object.getVersionTracking().getId();
        this.codeVersionTracking = object.getVersionTracking().getCode();
        if(object.getInstance()!=null){
            this.idInstance = object.getInstance().getId();
            this.codeInstance = object.getInstance().getCode();
        }
    }

    public ParameterValue toParameterValue() {
        return new ParameterValue()
                .setId(getId())
                .setCode(getCode())
                .setLabel(getLabel())
                .setVersion(getVersion())
                .setActive(isActive())
                .setParameter(new Parameter().setId(idParameter))
                .setApplication(new Application().setId(idApplication))
                .setVersionTracking(new VersionTracking().setId(idVersionTracking));
    }
}
