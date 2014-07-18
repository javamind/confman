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
@Table(name=ApplicationGroupment.TABLE_NAME)
public class ApplicationGroupment extends AbstractConfManEntity<ApplicationGroupment>{
    public final static String TABLE_NAME="applicationgrpt";
    public final static String SEQ_NAME= "seq_application_grpt";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ApplicationGroupment.SEQ_NAME)
    @SequenceGenerator(name = ApplicationGroupment.SEQ_NAME, sequenceName = ApplicationGroupment.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "applicationGroupment")
    private Set<Application> applications= new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "environment_id")
    private Environment environment;

    public ApplicationGroupment() {
    }

    public Environment getEnvironment() {
        return environment;
    }

    public ApplicationGroupment setEnvironment(Environment environment) {
        this.environment = environment;
        return this;
    }

    public ApplicationGroupment addApplication(Application application) {
        applications.add(application);
        return this;
    }

    public ApplicationGroupment removeApplication(Object o) {
        applications.remove(o);
        return this;
    }

    public void clearApplication() {
        applications.clear();
    }

    public Set<Application> getApplications() {
        return Collections.unmodifiableSet(applications);
    }

    public Long getId() {
        return id;
    }

    public ApplicationGroupment setId(Long id) {
        this.id = id;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ApplicationGroupment that = (ApplicationGroupment) o;

        if (environment != null ? !environment.equals(that.environment) : that.environment != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (environment != null ? environment.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .add("environment", environment)
                .toString();
    }
}
