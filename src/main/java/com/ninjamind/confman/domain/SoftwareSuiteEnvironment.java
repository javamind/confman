package com.ninjamind.confman.domain;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Linked between {@link com.ninjamind.confman.domain.Environment} and
 * {@link com.ninjamind.confman.domain.SoftwareSuite}
 *
 * @author EHRET_G
 */
@Entity
@Table(name= SoftwareSuiteEnvironment.TABLE_NAME)
public class SoftwareSuiteEnvironment implements Serializable{
    public final static String TABLE_NAME="softwaresuite_environment";

    @EmbeddedId
    private SoftwareSuiteEnvironmentId id;

    private boolean active;
    @Version
    private Long version;

    public SoftwareSuiteEnvironment() {
    }

    public SoftwareSuiteEnvironment(SoftwareSuiteEnvironmentId id) {
        this.id = id;
    }

    public SoftwareSuiteEnvironment(SoftwareSuite softwareSuite, Environment environment) {
        this.id = new SoftwareSuiteEnvironmentId(softwareSuite, environment);
    }

    public SoftwareSuiteEnvironmentId getId() {
        return id;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
        if (!(o instanceof SoftwareSuiteEnvironment)) return false;

        SoftwareSuiteEnvironment that = (SoftwareSuiteEnvironment) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
