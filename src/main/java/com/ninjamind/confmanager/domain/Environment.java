package com.ninjamind.confmanager.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * you always need several environment when you develop an application : development, staging, production
 *
 * @author EHRET_G
 */
@Entity
@Table(name=Environment.TABLE_NAME)
public class Environment extends AbstractConfManEntity{
    public final static String TABLE_NAME="environment";
    public final static String SEQ_NAME= "seq_environment";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Environment.SEQ_NAME)
    @SequenceGenerator(name = Environment.SEQ_NAME, sequenceName = Environment.SEQ_NAME, allocationSize = 1)
    private Long id;
    @OneToMany(mappedBy = "environment")
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
