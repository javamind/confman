package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

/**
 * {@link }
 *
 * @author EHRET_G
 */
@Entity
public class Parameter extends AbstractConfManEntity{
    @ManyToOne
    private ParameterGroupment parameterGroupment;
    @ManyToOne
    private Instance instance;

    public Parameter() {
    }

    public Parameter(String code, String label) {
        super(code, label);
    }

    public Parameter(String code, String label, Instance instance) {
        super(code, label);
        this.instance = instance;
    }

    public Instance getInstance() {
        return instance;
    }

    public void setInstance(Instance instance) {
        this.instance = instance;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        Parameter parameter = (Parameter) o;

        if (instance != null ? !instance.equals(parameter.instance) : parameter.instance != null) return false;
        if (parameterGroupment != null ? !parameterGroupment.equals(parameter.parameterGroupment) : parameter.parameterGroupment != null)
            return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = super.hashCode();
        result = 31 * result + (parameterGroupment != null ? parameterGroupment.hashCode() : 0);
        result = 31 * result + (instance != null ? instance.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .addValue(super.toString())
                .add("parameterGroupment", parameterGroupment)
                .add("instance", instance)
                .toString();
    }
}
