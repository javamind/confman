package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.*;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author EHRET_G
 */
public class ParameterValueDto extends AbstractConfManDto {
    protected String value;
    protected Long idVersionTracking;
    protected String codeVersionTracking;
    protected Long idApplication;
    protected String codeApplication;
    protected Long idParameter;
    protected Long idInstance;
    protected String codeInstance;
    protected Long idEnvironment;
    protected String codeEnvironment;

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
        this.idEnvironment = object.getEnvironment().getId();
        this.codeEnvironment = object.getEnvironment().getCode();
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
