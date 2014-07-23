package com.ninjamind.confman.domain;

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
public class Environment extends AbstractConfManEntity<Environment>{
    public final static String TABLE_NAME="environment";
    public final static String SEQ_NAME= "seq_environment";

    @Id
    @GeneratedValue(strategy= GenerationType.AUTO, generator = Environment.SEQ_NAME)
    @SequenceGenerator(name = Environment.SEQ_NAME, sequenceName = Environment.SEQ_NAME, allocationSize = 1)
    private Long id;
    @ManyToMany(mappedBy = "environments")
    private Set<SoftwareSuite> softwareSuites = new HashSet<>();

    public Environment() {
    }

    public Environment addApplicationGroupment(SoftwareSuite softwareSuite) {
        softwareSuites.add(softwareSuite);
        return this;
    }

    public Environment removeApplicationGroupment(Object o) {
        softwareSuites.remove(o);
        return this;
    }

    public void clearApplicationGroupment() {
        softwareSuites.clear();
    }

    public Set<SoftwareSuite> getSoftwareSuites() {
        return Collections.unmodifiableSet(softwareSuites);
    }

    public Long getId() {
        return id;
    }

    public Environment setId(Long id) {
        this.id = id;
        return this;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("id", id)
                .addValue(super.toString())
                .toString();
    }
}
