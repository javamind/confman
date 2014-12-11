package com.ninjamind.confman.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.common.base.Objects;
import com.ninjamind.confman.domain.AbstractConfManEntity;

import java.io.Serializable;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
@JsonIgnoreProperties(ignoreUnknown=true)
public abstract class AbstractConfmanAppDto<T extends AbstractConfmanAppDto, E extends AbstractConfManEntity> implements ConfmanAppDto<E> {
    /**
     * Id
     */
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
     * Active
     */
    private boolean active;


    /**
     * Default constructor
     */
    public AbstractConfmanAppDto() {
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfmanAppDto(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfmanAppDto(Long id, String code, String label, Long version, boolean active) {
        this.id=id;
        this.code = code;
        this.label = label;
        this.version = version;
        this.active = active;
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
        return (T)this;
    }

    public Long getId() {
        return id;
    }

    public T setId(Long id) {
        this.id = id;
        return (T) this;
    }

    public boolean isActive() {
        return active;
    }

    public T setActive(boolean active) {
        this.active = active;
        return (T) this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AbstractConfmanAppDto that = (AbstractConfmanAppDto) o;

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
