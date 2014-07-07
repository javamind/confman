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
public class VersionTracking extends AbstractConfManEntity{
    @OneToMany(mappedBy = "instance")
    private Set<Instance> instances= new HashSet<>();
    @ManyToOne
    private ApplicationVersion applicationVersion;

    public VersionTracking() {
    }

    public VersionTracking(String code, String label) {
        super(code, label);
    }

    public VersionTracking(String code, String label, ApplicationVersion applicationVersion) {
        super(code, label);
        this.applicationVersion = applicationVersion;
    }

    public ApplicationVersion getApplicationVersion() {
        return applicationVersion;
    }

    public void setApplicationVersion(ApplicationVersion applicationVersion) {
        this.applicationVersion = applicationVersion;
    }


    public boolean addInstance(Instance instance) {
        return instances.add(instance);
    }

    public boolean removeInstance(Object o) {
        return instances.remove(o);
    }

    public void clearInstance() {
        instances.clear();
    }

    public Set<Instance> getInstances() {
        return Collections.unmodifiableSet(instances);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        VersionTracking that = (VersionTracking) o;

        if (applicationVersion != null ? !applicationVersion.equals(that.applicationVersion) : that.applicationVersion != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (applicationVersion != null ? applicationVersion.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .addValue(super.toString())
                .add("applicationVersion", applicationVersion)
                .toString();
    }
}
