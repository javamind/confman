package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * A tracking version represent a little modification in the conf made without make a release
 *
 * @author EHRET_G
 */
@Entity
@Table(name=TrackingVersion.TABLE_NAME)
public class TrackingVersion extends AbstractConfManEntity<TrackingVersion>{
    public final static String TABLE_NAME="trackingversion";
    public final static String SEQ_NAME= "seq_version_tracking";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = TrackingVersion.SEQ_NAME)
    @SequenceGenerator(name = TrackingVersion.SEQ_NAME, sequenceName = TrackingVersion.SEQ_NAME, allocationSize = 1)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "applicationVersion_id")
    private ApplicationVersion applicationVersion;

    private boolean blocked;

    @OneToMany(mappedBy = "application")
    private Set<ParameterValue> parameterValues= new HashSet<>();

    public TrackingVersion() {
    }

    public ApplicationVersion getApplicationVersion() {
        return applicationVersion;
    }

    public TrackingVersion setApplicationVersion(ApplicationVersion applicationVersion) {
        this.applicationVersion = applicationVersion;
        return this;
    }

    public Long getId() {
        return id;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public TrackingVersion setBlocked(boolean blocked) {
        this.blocked = blocked;
        return this;
    }

    public TrackingVersion setId(Long id) {
        this.id = id;
        return this;
    }
    public TrackingVersion addParameterValue(ParameterValue parameter) {
        parameterValues.add(parameter);
        return this;
    }

    public TrackingVersion removeParameterValue(ParameterValue o) {
        parameterValues.remove(o);
        return this;
    }

    public void clearParameterValues() {
        parameterValues.clear();
    }

    public Set<ParameterValue> getParameterValues() {
        return Collections.unmodifiableSet(parameterValues);
    }

    public TrackingVersion addAllParameters(Collection<ParameterValue> collection) {
        parameterValues.addAll(collection);
        return this;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        TrackingVersion that = (TrackingVersion) o;

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
                .add("id", id)
                .addValue(super.toString())
                .add("applicationVersion", applicationVersion)
                .toString();
    }
}
