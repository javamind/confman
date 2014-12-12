package com.ninjamind.confman.domain;

import com.google.common.base.Objects;

import javax.persistence.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * you always need several environment when you develop an application : development, staging, production
 *
 * @author Guillaume EHRET
 */
@Entity
@Table(name=Environment.TABLE_NAME)
public class Environment extends AbstractConfManEntity<Environment>{
    public final static String TABLE_NAME="environment";
    public final static String SEQ_NAME= "seq_environment";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Environment.SEQ_NAME)
    @SequenceGenerator(name = Environment.SEQ_NAME, sequenceName = Environment.SEQ_NAME, allocationSize = 1)
    private Long id;

    @OneToMany(mappedBy = "id.environment")
    private Set<SoftwareSuiteEnvironment> softwareSuiteEnvironments = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "profil")
    private Authority profil;

    public Environment() {
    }

    public Long getId() {
        return id;
    }

    public Environment setId(Long id) {
        this.id = id;
        return this;
    }

    public Set<SoftwareSuiteEnvironment> getSoftwareSuiteEnvironments() {
        return  Collections.unmodifiableSet(softwareSuiteEnvironments);
    }

    public Environment addSoftwareSuiteEnvironment(SoftwareSuiteEnvironment softwareSuiteEnvironment) {
        this.softwareSuiteEnvironments.add(softwareSuiteEnvironment);
        return this;
    }

    public Environment removeSoftwareSuiteEnvironment(SoftwareSuiteEnvironment softwareSuiteEnvironment) {
        this.softwareSuiteEnvironments.remove(softwareSuiteEnvironment);
        return this;
    }

    public Authority getProfil() {
        return profil;
    }

    public Environment setProfil(Authority profil) {
        this.profil = profil;
        return this;
    }

    public void clearSoftwareSuiteEnvironments() {
        softwareSuiteEnvironments.clear();
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .add("profil", profil!=null ? profil.getName() : null)
                .addValue(super.toString())
                .toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        return true;
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
