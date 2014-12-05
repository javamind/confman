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

import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;

/**
 * Parse version number properties into [major].[minor].[incremental].[qualifier] and [trimmed]. The version parsing
 * logic is crudely simple. It splits the version string into tokens using both "." and "-" as delimiters. It assumes
 * the first token is "major", the second token is "minor" the third token is "incremental" and any tokens after that
 * are "qualifier". "SNAPSHOT" is always omitted from qualifier.
 *
 * [trimmed] is the full version minus "-SNAPSHOT"
 *
 * @goal parse-version-properties
 */
public class ParseVersionPropertiesMojo extends AbstractMojo {
    public static final String MAVEN_SNAPSHOT_TOKEN = "SNAPSHOT";

    /**
     * @parameter default-value="${project}"
     * @required
     * @readonly
     */
    private MavenProject project;

    /**
     * The list of properties containing version numbers to parse
     *
     * @parameter
     * @required
     */
    private String[] properties;

    /**
     * If true, the plugin will emit no logging messages
     *
     * @parameter expression="${properties.silent}" default-value="false"
     * @required
     */
    private boolean silent;

    @Override
    public void execute() throws MojoExecutionException {
        Properties props = project.getProperties();
        for (String key : properties) {
            String value = getProperty(key);
            if (StringUtils.isBlank(value)) {
                continue;
            }
            Version version = parseVersion(value);
            setProjectProperty(key, "major", version.getMajor(), props);
            setProjectProperty(key, "minor", version.getMinor(), props);
            setProjectProperty(key, "incremental", version.getIncremental(), props);
            setProjectProperty(key, "qualifier", version.getQualifier(), props);
            setProjectProperty(key, "trimmed", trimSnapshot(value), props);
        }
    }

    protected String trimSnapshot(String version) {
        if (version.toUpperCase().endsWith("-" + MAVEN_SNAPSHOT_TOKEN)) {
            int length = MAVEN_SNAPSHOT_TOKEN.length() + 1;
            return StringUtils.left(version, version.length() - length);
        } else {
            return version;
        }
    }

    protected void setProjectProperty(String key, String suffix, String value, Properties props) {
        if (StringUtils.isBlank(value)) {
            return;
        }
        props.setProperty(key + "." + suffix, value);
        if (!silent) {
            getLog().info("Setting " + key + "." + suffix + "=" + value);
        }
    }

    protected Version parseVersion(String s) {
        boolean snapshot = s.toUpperCase().endsWith("-" + MAVEN_SNAPSHOT_TOKEN);
        Version version = new Version();
        version.setSnapshot(snapshot);
        String[] tokens = StringUtils.split(s, ".-");
        if (tokens.length > 0) {
            version.setMajor(tokens[0]);
        }
        if (tokens.length > 1) {
            version.setMinor(tokens[1]);
        }
        if (tokens.length > 2) {
            version.setIncremental(tokens[2]);
        }
        String qualifier = getQualifier(tokens);
        version.setQualifier(qualifier);
        return version;
    }

    protected String getQualifier(String[] tokens) {
        if (tokens.length <= 3) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 3; i < tokens.length; i++) {
            if (tokens[i].toUpperCase().equals(MAVEN_SNAPSHOT_TOKEN)) {
                break;
            }
            if (i != 3) {
                sb.append("-");
            }
            sb.append(tokens[i]);
        }
        return sb.toString();
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

    public String[] getProperties() {
        return properties;
    }

    public void setProperties(String[] properties) {
        this.properties = properties;
    }

    public boolean isSilent() {
        return silent;
    }

    public void setSilent(boolean silent) {
        this.silent = silent;
    }
}
