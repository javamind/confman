package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.io.Serializable;

/**
 * All our entities have common fields
 *
 * @author EHRET_G
 */
@MappedSuperclass
public abstract class AbstractConfManEntity<T extends AbstractConfManEntity> implements Serializable {

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
    @Version
    private Long version = Long.valueOf(0);

    /**
     * Default constructor
     */
    public AbstractConfManEntity() {
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfManEntity(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public T setCode(String code) {
        this.code = code;
        return (T) this;
    }

    public String getLabel() {
        return label;
    }

    public T setLabel(String label) {
        this.label = label;
        return (T) this;
    }

    public Long getVersion() {
        return version;
    }

    public T setVersion(Long version) {
        this.version = version;
        return (T) this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AbstractConfManEntity that = (AbstractConfManEntity) o;

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
