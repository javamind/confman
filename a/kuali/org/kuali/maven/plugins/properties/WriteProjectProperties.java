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

import java.util.List;
import java.util.Properties;

import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.kuali.common.util.CollectionUtils;
import org.kuali.common.util.PropertyUtils;

/**
 * Write project properties to a file.
 *
 * @author Jeff Caddel
 *
 * @goal write-project-properties
 */
public class WriteProjectProperties extends AbstractWritePropertiesMojo {

	/**
	 * If true, the plugin will include system properties when writing the properties file. System properties override both environment
	 * variables and project properties.
	 *
	 * @parameter default-value="false" expression="${properties.includeSystemProperties}"
	 */
	private boolean includeSystemProperties;

	/**
	 * If true, the plugin will include environment variables when writing the properties file. Environment variables are prefixed with
	 * "env". Environment variables override project properties.
	 *
	 * @parameter default-value="false" expression="${properties.includeEnvironmentVariables}"
	 */
	private boolean includeEnvironmentVariables;

	/**
	 * CSV list of properties to exclude. A single wildcard character <code>*</code> is supported.
	 *
	 * @parameter expression="${properties.exclude}"
	 */
	private String exclude;

	/**
	 * CSV list of properties to include. A single wildcard character <code>*</code> is supported.
	 *
	 * @parameter expression="${properties.include}"
	 */
	private String include;

	/**
	 * List of properties to include. A single wildcard character <code>*</code> is supported.
	 *
	 * @parameter
	 */
	private List<String> includes;

	/**
	 * List of properties to exclude. A single wildcard character <code>*</code> is supported.
	 *
	 * @parameter
	 */
	private List<String> excludes;

	/**
	 * If true placeholders are resolved before writing properties to the file
	 *
	 * @parameter expression="${properties.resolvePlaceholders}" default-value="false"
	 */
	private boolean resolvePlaceholders;

	/**
	 * If true, these Maven properties are added to the properties file:
	 *
	 * <pre>
	 *   project.groupId
	 *   project.artifactId
	 *   project.version
	 *   project.basedir
	 *   project.build.directory
	 * </pre>
	 *
	 * @parameter expression="${properties.includeStandardMavenProperties}" default-value="false"
	 */
	private boolean includeStandardMavenProperties;

	@Override
	public void execute() throws MojoExecutionException, MojoFailureException {
		Properties properties = new Properties();

		// Add project properties
		properties.putAll(project.getProperties());

		if (includeStandardMavenProperties) {
			properties.putAll(MavenUtils.getInternalMavenProperties(project));
		}

		// Add environment variables, overriding any existing properties with the same key
		if (includeEnvironmentVariables) {
			properties.putAll(PropertyUtils.getEnvAsProperties());
		}

		// Add system properties, overriding any existing properties with the same key
		if (includeSystemProperties) {
			properties.putAll(System.getProperties());
		}

		// Merge the lists with the csv values
		List<String> includeList = CollectionUtils.sortedMerge(includes, include);
		List<String> excludeList = CollectionUtils.sortedMerge(excludes, exclude);

		// Override any properties from the includes list with their equivalent system/env value
		override(properties, includeList);

		// Resolve placeholders
		if (resolvePlaceholders) {
			Properties resolved = PropertyUtils.getResolvedProperties(properties);
			getLog().info("Resolved " + resolved.size() + " properties");
			properties.putAll(resolved);
		}

		// Remove properties as appropriate
		PropertyUtils.trim(properties, includeList, excludeList);

		// Save the properties to a file
		writeProperties(outputFile, properties, outputStyle, prefix, encoding, comment);
	}

	protected void override(Properties properties, List<String> includes) {
		List<String> keys = PropertyUtils.getSortedKeys(properties, includes, null);
		Properties global = PropertyUtils.getGlobalProperties(properties);
		properties.clear();
		for (String key : keys) {
			String value = global.getProperty(key);
			if (value != null) {
				properties.setProperty(key, value);
			}
		}
	}

	public boolean isIncludeSystemProperties() {
		return includeSystemProperties;
	}

	public void setIncludeSystemProperties(boolean includeSystemProperties) {
		this.includeSystemProperties = includeSystemProperties;
	}

	public boolean isIncludeEnvironmentVariables() {
		return includeEnvironmentVariables;
	}

	public void setIncludeEnvironmentVariables(boolean includeEnvironmentVariables) {
		this.includeEnvironmentVariables = includeEnvironmentVariables;
	}

	public String getExclude() {
		return exclude;
	}

	public void setExclude(String exclude) {
		this.exclude = exclude;
	}

	public String getInclude() {
		return include;
	}

	public void setInclude(String include) {
		this.include = include;
	}

	public boolean isResolvePlaceholders() {
		return resolvePlaceholders;
	}

	public void setResolvePlaceholders(boolean resolvePlaceholders) {
		this.resolvePlaceholders = resolvePlaceholders;
	}

	public boolean isIncludeStandardMavenProperties() {
		return includeStandardMavenProperties;
	}

	public void setIncludeStandardMavenProperties(boolean includeStandardMavenProperties) {
		this.includeStandardMavenProperties = includeStandardMavenProperties;
	}

	public List<String> getIncludes() {
		return includes;
	}

	public void setIncludes(List<String> includes) {
		this.includes = includes;
	}

	public List<String> getExcludes() {
		return excludes;
	}

	public void setExcludes(List<String> excludes) {
		this.excludes = excludes;
	}

}
