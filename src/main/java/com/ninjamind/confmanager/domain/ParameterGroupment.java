package com.ninjamind.confmanager.domain;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Parameters can be grouped
 *
 * @author EHRET_G
 */
@Entity
public class ParameterGroupment extends AbstractConfManEntity{
    @OneToMany(mappedBy = "parameter")
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

}
