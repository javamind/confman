package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * To respond to a user's demand you often need to install several applications
 *
 * @author Guillaume EHRET
 */
@Entity
@Table(name= SoftwareSuite.TABLE_NAME)
public class SoftwareSuite extends AbstractConfManEntity<SoftwareSuite>{
    public final static String TABLE_NAME="softwaresuite";
    public final static String SEQ_NAME= "seq_softwaresuite";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = SoftwareSuite.SEQ_NAME)
    @SequenceGenerator(name = SoftwareSuite.SEQ_NAME, sequenceName = SoftwareSuite.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "softwareSuite")
    private Set<Application> applications= new HashSet<>();

    @OneToMany(mappedBy = "id.softwareSuite")
    private Set<SoftwareSuiteEnvironment> softwareSuiteEnvironments = new HashSet<>();

    public SoftwareSuite() {
    }

    public Set<SoftwareSuiteEnvironment> getSoftwareSuiteEnvironments() {
        return  Collections.unmodifiableSet(softwareSuiteEnvironments);
    }

    public SoftwareSuite addSoftwareSuiteEnvironment(SoftwareSuiteEnvironment softwareSuiteEnvironment) {
        this.softwareSuiteEnvironments.add(softwareSuiteEnvironment);
        return this;
    }

    public SoftwareSuite removeSoftwareSuiteEnvironment(SoftwareSuiteEnvironment softwareSuiteEnvironment) {
        this.softwareSuiteEnvironments.remove(softwareSuiteEnvironment);
        return this;
    }

    public SoftwareSuite clearSoftwareSuiteEnvironments() {
        softwareSuiteEnvironments.clear();
        return this;
    }

    public SoftwareSuite addApplication(Application application) {
        applications.add(application);
        return this;
    }

    public SoftwareSuite removeApplication(Object o) {
        applications.remove(o);
        return this;
    }

    public void clearApplications() {
        applications.clear();
    }

    public Set<Application> getApplications() {
        return Collections.unmodifiableSet(applications);
    }

    public Long getId() {
        return id;
    }

    public SoftwareSuite setId(Long id) {
        this.id = id;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        return true;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .toString();
    }
}
