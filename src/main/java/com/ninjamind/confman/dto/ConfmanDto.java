/**
 * Copyright (C) 2014 all@dev-mind.fr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
package com.ninjamind.confman.dto;

/**
 * This DTO is used to dialog with the API Java
 *
 * @author Guillaume EHRET
 */
public class ConfmanDto {
    protected Long id;
    protected String code;
    protected String label;
    protected String codeInstance;
    protected String codeEnvironment;
    protected String codeApplication;
    protected String value;
    protected String codeParameter;
    protected String version;
    protected String typeParameter;
    protected boolean generateWithLastParameterValuesSet;

    public ConfmanDto() {
        super();
    }

    public Long getId() {
        return id;
    }

    public ConfmanDto setId(Long id) {
        this.id = id;
        return this;
    }

    public String getCode() {
        return code;
    }

    public ConfmanDto setCode(String code) {
        this.code = code;
        return this;
    }

    public String getLabel() {
        return label;
    }

    public ConfmanDto setLabel(String label) {
        this.label = label;
        return this;
    }

    public String getCodeInstance() {
        return codeInstance;
    }

    public ConfmanDto setCodeInstance(String codeInstance) {
        this.codeInstance = codeInstance;
        return this;
    }

    public String getCodeEnvironment() {
        return codeEnvironment;
    }

    public ConfmanDto setCodeEnvironment(String codeEnvironment) {
        this.codeEnvironment = codeEnvironment;
        return this;
    }

    public String getCodeApplication() {
        return codeApplication;
    }

    public ConfmanDto setCodeApplication(String codeApplication) {
        this.codeApplication = codeApplication;
        return this;
    }

    public String getValue() {
        return value;
    }

    public ConfmanDto setValue(String value) {
        this.value = value;
        return this;
    }

    public String getCodeParameter() {
        return codeParameter;
    }

    public ConfmanDto setCodeParameter(String codeParameter) {
        this.codeParameter = codeParameter;
        return this;
    }

    public String getVersion() {
        return version;
    }

    public ConfmanDto setVersion(String version) {
        this.version = version;
        return this;
    }

    public String getTypeParameter() {
        return typeParameter;
    }

    public ConfmanDto setTypeParameter(String typeParameter) {
        this.typeParameter = typeParameter;
        return this;
    }

    public boolean isGenerateWithLastParameterValuesSet() {
        return generateWithLastParameterValuesSet;
    }

    public ConfmanDto setGenerateWithLastParameterValuesSet(boolean generateWithLastParameterValuesSet) {
        this.generateWithLastParameterValuesSet = generateWithLastParameterValuesSet;
        return this;
    }
}
