package com.ninjamind.confmanager.domain;

import javax.persistence.Entity;
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
public class Environment extends AbstractConfManEntity{
    @OneToMany(mappedBy = "applicationGroupment")
    private Set<ApplicationGroupment> applicationGroupments= new HashSet<>();

    public Environment() {
    }

    public Environment(String code, String label) {
        super(code, label);
    }

    public boolean addApplicationGroupment(ApplicationGroupment applicationGroupment) {
        return applicationGroupments.add(applicationGroupment);
    }

    public boolean removeApplicationGroupment(Object o) {
        return applicationGroupments.remove(o);
    }

    public void clearApplicationGroupment() {
        applicationGroupments.clear();
    }

    public Set<ApplicationGroupment> getApplicationGroupments() {
        return Collections.unmodifiableSet(applicationGroupments);
    }
}
