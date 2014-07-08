package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Entity
@Table(name=VersionTracking.TABLE_NAME)
public class VersionTracking extends AbstractConfManEntity{
    public final static String TABLE_NAME="versiontracking";
    public final static String SEQ_NAME= "seq_version_tracking";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = VersionTracking.SEQ_NAME)
    @SequenceGenerator(name = VersionTracking.SEQ_NAME, sequenceName = VersionTracking.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "instance")
    private Set<Instance> instances= new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "applicationVersion_id")
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
                .add("id", id)
                .addValue(super.toString())
                .add("applicationVersion", applicationVersion)
                .toString();
    }
}
