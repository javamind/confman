package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * A version is fixed but sometimes we have to change only one parameter in the conf without make a release
 *
 * @author Guillaume EHRET
 */
@Entity
@Table(name=ApplicationVersion.TABLE_NAME)
public class ApplicationVersion extends AbstractConfManEntity<ApplicationVersion>{
    public final static String TABLE_NAME="applicationversion";
    public final static String SEQ_NAME= "seq_application_version";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ApplicationVersion.SEQ_NAME)
    @SequenceGenerator(name = ApplicationVersion.SEQ_NAME, sequenceName = ApplicationVersion.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "applicationVersion")
    private Set<TrackingVersion> trackingVersions= new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    private boolean blocked;

    public ApplicationVersion() {
    }

    public Application getApplication() {
        return application;
    }

    public ApplicationVersion setApplication(Application application) {
        this.application = application;
        return this;
    }

    public ApplicationVersion addTrackingVersion(TrackingVersion trackingVersion) {
        trackingVersions.add(trackingVersion);
        return this;
    }

    public ApplicationVersion removeTrackingVersion(Object o) {
        trackingVersions.remove(o);
        return this;
    }

    public void clearTrackingVersion() {
        trackingVersions.clear();
    }

    public Set<TrackingVersion> getTrackingVersions() {
        return Collections.unmodifiableSet(trackingVersions);
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
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

    public Long getId() {
        return id;
    }

    public ApplicationVersion setId(Long id) {
        this.id = id;
        return this;
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
                .add("id", id)
                .addValue(super.toString())
                .add("application", application)
                .toString();
    }
}
