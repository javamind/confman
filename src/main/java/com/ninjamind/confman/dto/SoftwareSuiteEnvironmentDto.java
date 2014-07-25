package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.SoftwareSuite;
import com.ninjamind.confman.domain.SoftwareSuiteEnvironment;

import java.io.Serializable;

/**
 * {@link com.ninjamind.confman.domain.SoftwareSuite}
 * {@link com.ninjamind.confman.domain.Environment}
 * @author EHRET_G
 */
public class SoftwareSuiteEnvironmentDto implements Serializable {

    private Long idSoftwareSuiteDto;
    private String codeSoftwareSuiteDto;
    private Long idEnvironmentDto;
    private String codeEnvironmentDto;

    public SoftwareSuiteEnvironmentDto() {
        super();
    }

    public SoftwareSuiteEnvironmentDto(SoftwareSuiteEnvironment softwareSuiteEnvironment) {
        idEnvironmentDto = softwareSuiteEnvironment.getId().getEnvironment().getId();
        codeEnvironmentDto = softwareSuiteEnvironment.getId().getEnvironment().getCode();
        idSoftwareSuiteDto = softwareSuiteEnvironment.getId().getSoftwareSuite().getId();
        codeSoftwareSuiteDto = softwareSuiteEnvironment.getId().getSoftwareSuite().getCode();
    }

    public SoftwareSuiteEnvironmentDto(SoftwareSuite soft, Environment env) {
        idEnvironmentDto = env.getId();
        codeEnvironmentDto = env.getCode();
        idSoftwareSuiteDto = soft.getId();
        codeSoftwareSuiteDto = soft.getCode();
    }

    public SoftwareSuiteEnvironment toSoftwareSuiteEnvironment() {
        return new SoftwareSuiteEnvironment(
                new SoftwareSuite().setId(getIdSoftwareSuiteDto()).setCode(getCodeSoftwareSuiteDto()),
                new Environment().setId(getIdEnvironmentDto()).setCode(getCodeEnvironmentDto())
        );
    }


    public Long getIdSoftwareSuiteDto() {
        return idSoftwareSuiteDto;
    }

    public void setIdSoftwareSuiteDto(Long idSoftwareSuiteDto) {
        this.idSoftwareSuiteDto = idSoftwareSuiteDto;
    }

    public String getCodeSoftwareSuiteDto() {
        return codeSoftwareSuiteDto;
    }

    public void setCodeSoftwareSuiteDto(String codeSoftwareSuiteDto) {
        this.codeSoftwareSuiteDto = codeSoftwareSuiteDto;
    }

    public Long getIdEnvironmentDto() {
        return idEnvironmentDto;
    }

    public void setIdEnvironmentDto(Long idEnvironmentDto) {
        this.idEnvironmentDto = idEnvironmentDto;
    }

    public String getCodeEnvironmentDto() {
        return codeEnvironmentDto;
    }

    public void setCodeEnvironmentDto(String codeEnvironmentDto) {
        this.codeEnvironmentDto = codeEnvironmentDto;
    }
}
