package com.ninjamind.confman.dto;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
public class InstanceConfmanDto extends AbstractConfmanApiDto<InstanceConfmanDto> {
    private String codeApplication;
    private String codeEnvironment;

    /**
     * Default constructor
     */
    public InstanceConfmanDto() {
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public InstanceConfmanDto setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public String getCodeEnvironment() {
        return codeEnvironment;
    }

    public InstanceConfmanDto setCodeEnvironment(String codeEnvironment) {
        this.codeEnvironment = codeEnvironment;
        return this;
    }
}
