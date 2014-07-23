package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * To respond to a user's demand you often need to install several applications
 *
 * @author EHRET_G
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

    @ManyToMany
    @JoinTable(
            name = "softwaresuite_environment",
            joinColumns = {@JoinColumn(name = "environment_id", referencedColumnName = "id")},
            inverseJoinColumns = {@JoinColumn(name = "softwaresuite_id", referencedColumnName = "id")})
    private Set<Environment> environments = new HashSet<>();

    public SoftwareSuite() {
    }

    public Set<Environment> getEnvironments() {
        return  Collections.unmodifiableSet(environments);
    }

    public SoftwareSuite addEnvironment(Environment environment) {
        this.environments.add(environment);
        return this;
    }

    public SoftwareSuite removeEnvironment(Environment environment) {
        this.environments.remove(environment);
        return this;
    }

    public void clearEnvironnements() {
        environments.clear();
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
