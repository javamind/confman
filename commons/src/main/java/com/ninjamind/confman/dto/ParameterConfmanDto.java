package com.ninjamind.confman.dto;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
public class ParameterConfmanDto extends AbstractConfmanApiDto<ParameterConfmanDto> {
    private String codeApplication;
    private String type;

    /**
     * Default constructor
     */
    public ParameterConfmanDto() {
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public ParameterConfmanDto setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public String getType() {
        return type;
    }

    public ParameterConfmanDto setType(String type) {
        this.type = type;
        return this;
    }
}
