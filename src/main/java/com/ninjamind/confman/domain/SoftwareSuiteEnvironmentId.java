package com.ninjamind.confman.domain;

import javax.persistence.Embeddable;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.io.Serializable;

/**
 * Linked between {@link Environment} and
 * {@link SoftwareSuite}
 *
 * @author Guillaume EHRET
 */

@Embeddable
public class SoftwareSuiteEnvironmentId implements Serializable {
    @ManyToOne
    @JoinColumn(name = "softwaresuite_id")
    private SoftwareSuite softwareSuite;

    @ManyToOne
    @JoinColumn(name = "environment_id")
    private Environment environment;


    public SoftwareSuiteEnvironmentId() {
    }

    public SoftwareSuiteEnvironmentId(SoftwareSuite softwareSuite, Environment environment) {
        this.softwareSuite = softwareSuite;
        this.environment = environment;
    }

    public SoftwareSuite getSoftwareSuite() {
        return softwareSuite;
    }

    public void setSoftwareSuite(SoftwareSuite softwareSuite) {
        this.softwareSuite = softwareSuite;
    }

    public Environment getEnvironment() {
        return environment;
    }

    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SoftwareSuiteEnvironmentId)) return false;

        SoftwareSuiteEnvironmentId that = (SoftwareSuiteEnvironmentId) o;

        if (!environment.equals(that.environment)) return false;
        if (!softwareSuite.equals(that.softwareSuite)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = softwareSuite.hashCode();
        result = 31 * result + environment.hashCode();
        return result;
    }
}
