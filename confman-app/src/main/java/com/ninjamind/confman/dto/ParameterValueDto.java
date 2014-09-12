package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.*;
import com.ninjamind.confman.utils.Converter;

import java.util.LinkedHashMap;

/**
 * {@link com.ninjamind.confman.domain.Parameter}
 *
 * @author Guillaume EHRET
 */
public class ParameterValueDto extends AbstractConfManDto {
    protected String oldValue;
    protected Long idTrackingVersion;
    protected String codeTrackingVersion;
    protected Long idApplication;
    protected String codeApplication;
    protected Long idParameter;
    protected Long idInstance;
    protected String codeInstance;
    protected Long idEnvironment;
    protected String codeEnvironment;
    protected boolean toDelete;

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
        this.oldValue = object.getOldvalue();
        this.idApplication = object.getApplication().getId();
        this.codeApplication = object.getApplication().getCode();
        this.idParameter = object.getParameter().getId();
        this.idTrackingVersion = object.getTrackingVersion().getId();
        this.codeTrackingVersion = object.getTrackingVersion().getCode();
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
                .setOldvalue(oldValue)
                .setVersion(getVersion())
                .setActive(isActive())
                .setEnvironment(new Environment().setId(idEnvironment))
                .setParameter(new Parameter().setId(idParameter))
                .setApplication(new Application().setId(idApplication))
                .setTrackingVersion(new TrackingVersion().setId(idTrackingVersion));
    }

    public static ParameterValue toParameterValue(LinkedHashMap map){
        return new ParameterValue()
                .setId(Converter.convertId(map.get("id")))
                .setCode(Converter.convert(map.get("code"), String.class))
                .setLabel(Converter.convert(map.get("label"), String.class))
                .setOldvalue(Converter.convert(map.get("oldValue"), String.class))
                .setVersion(Converter.convertId(map.get("version")))
                .setActive(Converter.convert(map.get("active"), Boolean.class))
                .setParameter(new Parameter().setId(Converter.convertId(map.get("idParameter"))))
                .setApplication(new Application().setId(Converter.convertId(map.get("idApplication"))))
                .setEnvironment(new Environment().setId(Converter.convertId(map.get("idEnvironment"))))
                .setTrackingVersion(new TrackingVersion().setId(Converter.convertId(map.get("idTrackingVersion"))));
    }

    public boolean isToDelete() {
        return toDelete;
    }
}
