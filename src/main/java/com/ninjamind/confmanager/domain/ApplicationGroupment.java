package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Entity
public class ApplicationGroupment extends AbstractConfManEntity{
    @OneToMany(mappedBy = "application")
    private Set<Application> applications= new HashSet<>();
    @ManyToOne
    private Environment environment;

    public ApplicationGroupment() {
    }

    public ApplicationGroupment(String code, String label) {
        super(code, label);
    }

    public ApplicationGroupment(String code, String label, Environment environment) {
        super(code, label);
        this.environment = environment;
    }

    public Environment getEnvironment() {
        return environment;
    }

    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public boolean addApplication(Application application) {
        return applications.add(application);
    }

    public boolean removeApplication(Object o) {
        return applications.remove(o);
    }

    public void clearApplication() {
        applications.clear();
    }

    public Set<Application> getApplications() {
        return Collections.unmodifiableSet(applications);
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
                .addValue(super.toString())
                .add("environment", environment)
                .toString();
    }
}
