package com.ninjamind.confman.dto;

import com.google.common.base.Objects;

import java.io.Serializable;

/**
 * All our entities have common fields
 *
 * @author EHRET_G
 */
public abstract class AbstractConfManDto implements Serializable {
    private Long id;
    /**
     * Code
     */
    private String code;
    /**
     * A label
     */
    private String label;
    /**
     * Data version
     */
    private Long version = Long.valueOf(0);

    /**
     * Default constructor
     */
    public AbstractConfManDto() {
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfManDto(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfManDto(Long id, String code, String label, Long version) {
        this.id=id;
        this.code = code;
        this.label = label;
        this.version = version;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AbstractConfManDto that = (AbstractConfManDto) o;

        if (!code.equals(that.code)) return false;
        if (!label.equals(that.label)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = code.hashCode();
        result = 31 * result + label.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("code", code)
                .add("label", label)
                .toString();
    }

}
