package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.*;

/**
 * All our entities have common fields
 *
 * @author EHRET_G
 */
@MappedSuperclass
public class AbstractConfManEntity {
    /**
     * Id (sequence)
     */
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
                .add("id", id)
                .add("code", code)
                .add("label", label)
                .toString();
    }
}
