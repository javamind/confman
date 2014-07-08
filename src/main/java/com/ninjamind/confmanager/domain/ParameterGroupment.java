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
@Table(name=ParameterGroupment.TABLE_NAME)
public class ParameterGroupment extends AbstractConfManEntity{
    public final static String TABLE_NAME="parametergrpt";
    public final static String SEQ_NAME= "seq_parameter_grpt";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = ParameterGroupment.SEQ_NAME)
    @SequenceGenerator(name = ParameterGroupment.SEQ_NAME, sequenceName = ParameterGroupment.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "parameterGroupment")
    private Set<Parameter> parameters= new HashSet<>();

    public ParameterGroupment() {
    }

    public ParameterGroupment(String code, String label) {
        super(code, label);
    }

    public boolean addParameter(Parameter instance) {
        return parameters.add(instance);
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
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .toString();
    }

}
