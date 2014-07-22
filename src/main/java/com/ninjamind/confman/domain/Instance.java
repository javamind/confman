package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * An application can be installed on several servers
 *
 * @author EHRET_G
 */
@Entity
@Table(name=Instance.TABLE_NAME)
public class Instance extends AbstractConfManEntity<Instance>{
    public final static String TABLE_NAME="instance";
    public final static String SEQ_NAME= "seq_instance";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Instance.SEQ_NAME)
    @SequenceGenerator(name = Instance.SEQ_NAME, sequenceName = Instance.SEQ_NAME, allocationSize = 1)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "versionTracking_id")
    private VersionTracking versionTracking;
    @OneToMany(mappedBy = "instance")
    private Set<Parameter> parameters= new HashSet<>();

    public Instance() {
    }

    public VersionTracking getVersionTracking() {
        return versionTracking;
    }

    public Instance setVersionTracking(VersionTracking versionTracking) {
        this.versionTracking = versionTracking;
        return this;
    }

    public Instance addParameter(Parameter parameter) {
        parameters.add(parameter);
        return this;
    }

    public Instance removeParameter(Object o) {
        parameters.remove(o);
        return this;
    }

    public void clearParameter() {
        parameters.clear();
    }

    public Set<Parameter> getParameters() {
        return Collections.unmodifiableSet(parameters);
    }

    public Long getId() {
        return id;
    }

    public Instance setId(Long id) {
        this.id = id;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        Instance instance = (Instance) o;

        if (versionTracking != null ? !versionTracking.equals(instance.versionTracking) : instance.versionTracking != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (versionTracking != null ? versionTracking.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .add("versionTracking", versionTracking)
                .toString();
    }
}