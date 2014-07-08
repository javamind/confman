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
@Table(name=Instance.TABLE_NAME)
public class Instance extends AbstractConfManEntity{
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

    public Instance(String code, String label) {
        super(code, label);
    }

    public Instance(String code, String label, VersionTracking versionTracking) {
        super(code, label);
        this.versionTracking = versionTracking;
    }

    public VersionTracking getVersionTracking() {
        return versionTracking;
    }

    public void setVersionTracking(VersionTracking versionTracking) {
        this.versionTracking = versionTracking;
    }

    public boolean addParameter(Parameter parameter) {
        return parameters.add(parameter);
    }

    public boolean removeParameter(Object o) {
        return parameters.remove(o);
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

    public void setId(Long id) {
        this.id = id;
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
