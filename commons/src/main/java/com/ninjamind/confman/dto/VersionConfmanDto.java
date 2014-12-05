package com.ninjamind.confman.dto;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
public class VersionConfmanDto extends AbstractConfmanApiDto<VersionConfmanDto> {
    private String codeApplication;
    private String codeTrackingversion;

    /**
     * Default constructor
     */
    public VersionConfmanDto() {
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public VersionConfmanDto setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public String getCodeTrackingversion() {
        return codeTrackingversion;
    }

    public VersionConfmanDto setCodeTrackingversion(String codeTrackingversion) {
        this.codeTrackingversion = codeTrackingversion;
        return this;
    }
}
