package com.ninjamind.confman.dto;

import com.ninjamind.confman.domain.Environment;
import com.ninjamind.confman.domain.SoftwareSuite;

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

    public SoftwareSuiteEnvironmentDto(SoftwareSuite soft, Environment env) {
        idEnvironmentDto = env.getId();
        codeEnvironmentDto = env.getCode();
        idSoftwareSuiteDto = soft.getId();
        codeSoftwareSuiteDto = soft.getCode();
    }
}
