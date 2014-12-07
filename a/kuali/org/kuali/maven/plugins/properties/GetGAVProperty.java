/**
 * Copyright 2009-2013 The Kuali Foundation
 *
 * Licensed under the Educational Community License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.opensource.org/licenses/ecl2.php
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.kuali.maven.plugins.properties;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;

/**
 * Find a GAV specific property value using GroupId+ArtifactId+Version. The logic goes from most specific to least
 * specific. If there is a value for the full GAV, that value is used. Otherwise, a value for GroupId + ArtifactId, or
 * finally just GroupId. If no value is found, the defaultValue is used.
 *
 * A new project property with .gav appended is set if a value is found.
 *
 * @goal get-gav-property
 */
public class GetGAVProperty extends AbstractMojo {

    /**
     * @parameter default-value="${project}"
     * @required
     * @readonly
     */
    private MavenProject project;

    /**
     * @parameter expression="${properties.groupId}" default-value="${project.groupId}"
     */
    private String groupId;

    /**
     * @parameter expression="${properties.artifactId}" default-value="${project.artifactId}"
     */
    private String artifactId;

    /**
     * @parameter expression="${properties.version}" default-value="${project.version}"
     */
    private String version;

    /**
     * @parameter expression="${properties.property}"
     */
    private String property;

    /**
     * @parameter expression="${properties.defaultValue}"
     */
    private String defaultValue;

    /**
     * @parameter expression="${properties.suffix}" default-value="gav"
     */
    private String suffix;

    @Override
    public void execute() throws MojoExecutionException {
        List<String> keys = getKeys();
        String value = getValue(project, keys);
        if (StringUtils.isBlank(value)) {
            getLog().info("No value for '" + property + "'");
        } else {
            String key = property + "." + suffix;
            getLog().info("Setting " + key + "=" + value);
            project.getProperties().setProperty(key, value);
        }
    }

    protected String getValue(MavenProject project, List<String> keys) {
        for (String key : keys) {
            String value = getProperty(key);
            getLog().debug(key + "=" + value);
            if (!StringUtils.isBlank(value)) {
                return value;
            }
        }
        return defaultValue;
    }

    protected List<String> getKeys() {
        List<String> keys = new ArrayList<String>();
        keys.add(property + "." + groupId + "." + artifactId + "." + version);
        keys.add(property + "." + groupId + "." + artifactId);
        keys.add(property + "." + groupId);
        keys.add(property);
        return keys;
    }

    protected String getProperty(String key) {
        String sys = System.getProperty(key);
        String proj = project.getProperties().getProperty(key);
        if (!StringUtils.isBlank(sys)) {
            return sys;
        } else {
            return proj;
        }

    }

    public MavenProject getProject() {
        return project;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getArtifactId() {
        return artifactId;
    }

    public void setArtifactId(String artifactId) {
        this.artifactId = artifactId;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getProperty() {
        return property;
    }

    public void setProperty(String property) {
        this.property = property;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public void setProject(MavenProject project) {
        this.project = project;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

}
