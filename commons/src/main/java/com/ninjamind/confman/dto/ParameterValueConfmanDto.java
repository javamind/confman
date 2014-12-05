package com.ninjamind.confman.dto;

import com.ninjamind.confman.utils.Converter;

import java.util.LinkedHashMap;

/**
 *
 * @author Guillaume EHRET
 */
public class ParameterValueConfmanDto extends AbstractConfmanApiDto<ParameterValueConfmanDto> {
    protected String oldValue;
    protected Long idTrackingVersion;
    protected String codeTrackingVersion;
    protected Long idApplication;
    protected String codeApplication;
    protected Long idParameter;
    protected String labelParameter;
    protected Long idInstance;
    protected String codeInstance;
    protected Long idEnvironment;
    protected String codeEnvironment;
    protected boolean toDelete;

    public ParameterValueConfmanDto() {
        super();
    }

    public boolean isToDelete() {
        return toDelete;
    }

    public String getOldValue() {
        return oldValue;
    }

    public ParameterValueConfmanDto setOldValue(String oldValue) {
        this.oldValue = oldValue;
        return this;
    }

    public Long getIdTrackingVersion() {
        return idTrackingVersion;
    }

    public ParameterValueConfmanDto setIdTrackingVersion(Long idTrackingVersion) {
        this.idTrackingVersion = idTrackingVersion;
        return this;
    }

    public String getCodeTrackingVersion() {
        return codeTrackingVersion;
    }

    public ParameterValueConfmanDto setCodeTrackingVersion(String codeTrackingVersion) {
        this.codeTrackingVersion = codeTrackingVersion;
        return this;
    }

    public String getLabelParameter() {
        return labelParameter;
    }

    public ParameterValueConfmanDto setLabelParameter(String labelParameter) {
        this.labelParameter = labelParameter;
        return this;
    }

    public Long getIdApplication() {
        return idApplication;
    }

    public ParameterValueConfmanDto setIdApplication(Long idApplication) {
        this.idApplication = idApplication;
        return this;
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public ParameterValueConfmanDto setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public Long getIdParameter() {
        return idParameter;
    }

    public ParameterValueConfmanDto setIdParameter(Long idParameter) {
        this.idParameter = idParameter;
        return this;
    }

    public Long getIdInstance() {
        return idInstance;
    }

    public ParameterValueConfmanDto setIdInstance(Long idInstance) {
        this.idInstance = idInstance;
        return this;
    }

    public String getCodeInstance() {
        return codeInstance;
    }

    public ParameterValueConfmanDto setCodeInstance(String codeInstance) {
        this.codeInstance = codeInstance;
        return this;
    }

    public Long getIdEnvironment() {
        return idEnvironment;
    }

    public ParameterValueConfmanDto setIdEnvironment(Long idEnvironment) {
        this.idEnvironment = idEnvironment;
        return this;
    }

    public String getCodeEnvironment() {
        return codeEnvironment;
    }

    public ParameterValueConfmanDto setCodeEnvironment(String codeEnvironment) {
        this.codeEnvironment = codeEnvironment;
        return this;
    }

    public ParameterValueConfmanDto setToDelete(boolean toDelete) {
        this.toDelete = toDelete;
        return this;
    }

}
