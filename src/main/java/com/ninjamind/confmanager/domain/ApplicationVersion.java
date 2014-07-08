package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * A version is fixed but sometimes we have to change only one parameter in the conf without make a release
 *
 * @author EHRET_G
 */
@Entity
public class ApplicationVersion extends AbstractConfManEntity{
    @OneToMany(mappedBy = "versionTracking")
    private Set<VersionTracking> versionTrackings= new HashSet<>();
    @ManyToOne
    private Application application;

    public ApplicationVersion() {
    }

    public ApplicationVersion(String code, String label) {
        super(code, label);
    }

    public ApplicationVersion(String code, String label, Application application) {
        super(code, label);
        this.application = application;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public boolean addVersionTracking(VersionTracking versionTracking) {
        return versionTrackings.add(versionTracking);
    }

    public boolean removeVersionTracking(Object o) {
        return versionTrackings.remove(o);
    }

    public void clearVersionTracking() {
        versionTrackings.clear();
    }

    public Set<VersionTracking> getVersionTrackings() {
        return Collections.unmodifiableSet(versionTrackings);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        ApplicationVersion that = (ApplicationVersion) o;

        if (application != null ? !application.equals(that.application) : that.application != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (application != null ? application.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .addValue(super.toString())
                .add("application", application)
                .toString();
    }
}
