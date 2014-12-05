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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;
import org.kuali.common.util.CollectionUtils;
import org.kuali.maven.common.PropertiesUtils;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

/**
 * The read-project-properties goal reads property files and stores the properties as project properties. It serves as an alternate to
 * specifying properties in pom.xml.<br>
 *
 * Properties files handled by this plugin, have their property values resolved using Spring's expression parser. This means anything you
 * can do with Spring property values you can do with property values handled by this plugin. For example, nested properties are supported:
 * eg foo=${a.${b}.c}
 *
 * @author <a href="mailto:zarars@gmail.com">Zarar Siddiqi</a>
 * @author <a href="mailto:Krystian.Nowak@gmail.com">Krystian Nowak</a>
 * @auther Jeff Caddel
 * @version $Id: ReadPropertiesMojo.java 8861 2009-01-21 15:35:38Z pgier $
 * @goal read-project-properties
 */
public class ReadPropertiesMojo extends AbstractMojo {
	PropertiesUtils utils = new PropertiesUtils();

	/**
	 * @parameter default-value="${project}"
	 * @required
	 * @readonly
	 */
	private MavenProject project;

	/**
	 * Locations where properties files can be found. Any url Spring resource loading can understand is valid. eg
	 * <code>classpath:myprops.properties</code>. Both, .properties and .xml style properties are supported.
	 *
	 * @parameter
	 * @required
	 */
	private String[] locations;

	/**
	 * If true, the plugin will silently ignore any non-existent properties files, and the build will continue
	 *
	 * @parameter expression="${properties.quiet}" default-value="false"
	 */
	private boolean quiet;

	/**
	 * If true, the plugin will operate silently without emitting any log messages
	 *
	 * @parameter expression="${properties.silent}" default-value="false"
	 */
	private boolean silent;

	/**
	 * If true, the plugin will emit more verbose logging messages.
	 *
	 * @parameter expression="${properties.verbose}" default-value="false"
	 */
	private boolean verbose;

	/**
	 * Comma separated list of property values to ignore
	 *
	 * @parameter expression="${properties.ignore}"
	 */
	private String ignore;

	@Override
	public void execute() throws MojoExecutionException {
		// Figure out if there are properties we need to ignore
		List<String> ignoreList = getIgnoreList();

		// Update project properties by loading in properties from the locations they've specified
		updateProjectProperties(ignoreList);

		// Project + system + env properties
		Properties allProperties = utils.getMavenProperties(project);
		resolveValues(project.getProperties(), allProperties);

	}

	protected void resolveValues(Properties p1, Properties p2) {
		for (String name : p1.stringPropertyNames()) {
			String originalValue = p1.getProperty(name);
			String resolvedValue = utils.getResolvedValue(originalValue, p2);
			p1.setProperty(name, resolvedValue);
		}
	}

	/**
	 * Copy properties from p2 into p1, overwriting p1 values as we go.
	 *
	 * Ignore any properties with a key that appears in the ignore list
	 *
	 * @param p1
	 * @param p2
	 * @param ignore
	 */
	protected void updateProperties(Properties p1, Properties p2, List<String> ignore) {
		Set<String> names = p2.stringPropertyNames();
		for (String name : names) {
			if (!ignore.contains(name)) {
				String value = p2.getProperty(name);
				p1.setProperty(name, value);
			}
		}
	}

	protected String toEmpty(String s) {
		if (StringUtils.isBlank(s)) {
			return "";
		} else {
			return s;
		}
	}

	protected boolean exists(String location) {
		if (StringUtils.isBlank(location)) {
			return false;
		}
		File file = new File(location);
		if (file.exists()) {
			return true;
		}
		ResourceLoader loader = new DefaultResourceLoader();
		Resource resource = loader.getResource(location);
		return resource.exists();
	}

	protected boolean validate(String location) throws MojoExecutionException {
		boolean exists = exists(location);
		if (exists) {
			return true;
		}
		if (quiet) {
			if (verbose && !silent) {
				getLog().info("Ignoring non-existent properties file '" + toEmpty(location) + "'");
			}
			return false;
		} else {
			throw new MojoExecutionException("Non-existent properties file '" + location + "'");
		}
	}

	protected InputStream getInputStream(String location) throws IOException {
		File file = new File(location);
		if (file.exists()) {
			return new FileInputStream(location);
		}
		ResourceLoader loader = new DefaultResourceLoader();
		Resource resource = loader.getResource(location);
		return resource.getInputStream();
	}

	protected Properties getProperties(String location) throws MojoExecutionException {
		InputStream in = null;
		try {
			Properties properties = new Properties();
			in = getInputStream(location);
			if (location.toLowerCase().endsWith(".xml")) {
				properties.loadFromXML(in);
			} else {
				properties.load(in);
			}
			return properties;
		} catch (IOException e) {
			throw new MojoExecutionException("Error reading properties file " + location, e);
		} finally {
			IOUtils.closeQuietly(in);
		}
	}

	public boolean isQuiet() {
		return quiet;
	}

	public void setQuiet(boolean quiet) {
		this.quiet = quiet;
	}

	public String getIgnore() {
		return ignore;
	}

	public void setIgnore(String ignoreProperties) {
		this.ignore = ignoreProperties;
	}

	public MavenProject getProject() {
		return project;
	}

	public String[] getLocations() {
		return locations;
	}

	public void setLocations(String[] locations) {
		this.locations = locations;
	}

	public boolean isVerbose() {
		return verbose;
	}

	public void setVerbose(boolean verbose) {
		this.verbose = verbose;
	}

	public boolean isSilent() {
		return silent;
	}

	public void setSilent(boolean silent) {
		this.silent = silent;
	}

	protected List<String> getIgnoreList() {
		List<String> ignoreList = CollectionUtils.getTrimmedListFromCSV(ignore);
		if (!silent && verbose && !StringUtils.isBlank(ignore)) {
			getLog().info("Ignoring " + ignore);
		}
		return ignoreList;
	}

	protected void updateProjectProperties(List<String> ignoreList) throws MojoExecutionException {
		Properties projectProperties = project.getProperties();
		for (int i = 0; i < locations.length; i++) {
			Properties allProperties = utils.getMavenProperties(project);
			String originalLocation = locations[i];
			String resolvedLocation = utils.getResolvedValue(originalLocation, allProperties);
			getLog().debug("o=" + originalLocation + " r=" + resolvedLocation);
			if (!validate(resolvedLocation)) {
				continue;
			}
			if (!silent) {
				getLog().info("Loading " + resolvedLocation);
			}

			// Load properties from this location
			Properties p = getProperties(resolvedLocation);

			// Update project properties from the properties we just loaded
			updateProperties(projectProperties, p, ignoreList);
		}
	}

}
