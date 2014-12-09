package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
@MappedSuperclass
public abstract class AbstractConfManEntity<T extends AbstractConfManEntity> implements Serializable{

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
     * Use for logical deletion
     */
    private boolean active;
    /**
     * Change date of activation
     */
    @Temporal(TemporalType.DATE)
    @Column(name="active_change_date")
    private Date activeChangeDate;
    /**
     * Change date
     */
    @Temporal(TemporalType.DATE)
    @Column(name="change_date")
    private Date changeDate;
    /**
     * Change user
     */
    @Column(name="change_user")
    private String changeUser;

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

    public abstract Long getId();

    public boolean isActive() {
        return active;
    }

    public T setActive(boolean active) {
        this.active = active;
        return (T) this;
    }

    public Date getActiveChangeDate() {
        return activeChangeDate;
    }

    public T setActiveChangeDate(Date activeChangeDate) {
        this.activeChangeDate = activeChangeDate;
        return (T) this;
    }

    public Date getChangeDate() {
        return changeDate;
    }

    public T setChangeDate(Date changeDate) {
        this.changeDate = changeDate;
        return (T) this;
    }

    public String getChangeUser() {
        return changeUser;
    }

    public T setChangeUser(String changeUser) {
        this.changeUser = changeUser;
        return (T) this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AbstractConfManEntity that = (AbstractConfManEntity) o;
        if (!code.equals(that.code)) return false;
        return true;
    }

    @Override
    public int hashCode() {
        int result = code!=null ? code.hashCode(): 1;
        if(label!=null) {
            result = 31 * result + label.hashCode();
        }
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
