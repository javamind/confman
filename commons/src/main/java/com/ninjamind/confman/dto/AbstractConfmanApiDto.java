package com.ninjamind.confman.dto;

import com.ninjamind.confman.utils.Preconditions;

import java.io.Serializable;

/**
 * All our entities have common fields
 *
 * @author Guillaume EHRET
 */
public abstract class AbstractConfmanApiDto<T extends AbstractConfmanApiDto> implements Serializable {
    /**
     * Id
     */
    private Long id;
    /**
     * Code
     */
    private String code;
    /**
     * A label
     */
    private String label;

    /**
     * Default constructor
     */
    public AbstractConfmanApiDto() {
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfmanApiDto(String code, String label) {
        this.code = code;
        this.label = label;
    }

    /**
     * Functionnal constructor
     * @param code
     * @param label
     */
    public AbstractConfmanApiDto(Long id, String code, String label) {
        this.id=id;
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public T setCode(String code) {
        this.code = code;
        return (T) this;
    }

    public String getLabel() {
        return label;
    }

    public T setLabel(String label) {
        this.label = label;
        return (T) this;
    }

    public Long getId() {
        return id;
    }

    public T setId(Long id) {
        this.id = id;
        return (T) this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AbstractConfmanApiDto that = (AbstractConfmanApiDto) o;

        if (!code.equals(that.code)) return false;
        if (!label.equals(that.label)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = code.hashCode();
        result = 31 * result + label.hashCode();
        return result;
    }

    @Override
    public String toString() {
        return toStringHelper()
                .add("code", code)
                .add("label", label)
                .toString();
    }

    protected ToStringHelper toStringHelper() {
        return new ToStringHelper(this.getClass().getName());
    }

    /**
     * Helper to build toString method
     */
    public static final class ToStringHelper {
        StringBuilder builder;

        private ToStringHelper(String className) {
            Preconditions.checkNotNull(className, "Classname is required");
            builder = new StringBuilder(32).append(className).append('{');
        }

        /**
         * Adds a name/value pair to the formatted output in {@code name=value}
         * format.
         */
        public <T> ToStringHelper add(String name, T value) {
            builder.append(", ").append(name).append("=").append(value==null ? "null" : value);
            return this;
        }

        /**
         * Returns a string
         */
        @Override
        public String toString() {
            return builder.append("}").toString();
        }
    }
}
