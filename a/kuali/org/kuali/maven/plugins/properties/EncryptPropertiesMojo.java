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

import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;
import org.jasypt.util.text.TextEncryptor;
import org.kuali.common.util.EncUtils;
import org.kuali.common.util.PropertyUtils;

/**
 * Generate encrypted values for the specified system or project properties.
 * 
 * @goal encrypt
 */
public class EncryptPropertiesMojo extends AbstractMojo {

	/**
	 * @parameter default-value="${project}"
	 * @required
	 * @readonly
	 */
	private MavenProject project;

	/**
	 * The list of properties containing values to encrypt
	 * 
	 * @parameter
	 * @required
	 */
	private String[] properties;

	/**
	 * 
	 * The password for encrypting property values. This same password can be used to to decrypt the encrypted values.
	 * 
	 * @parameter expression="${properties.password}"
	 * @required
	 */
	private String password;

	@Override
	public void execute() throws MojoExecutionException {

		// Setup the encryptor
		TextEncryptor encryptor = EncUtils.getTextEncryptor(password);

		// Get project properties overridden by system/env properties
		Properties p = PropertyUtils.getGlobalProperties(project.getProperties());

		// Limit ourselves to just the project properties
		List<String> includes = PropertyUtils.getSortedKeys(project.getProperties());
		if (properties != null) {
			// Unless they've specified something else
			includes = Arrays.asList(properties);
		}

		// Trim things down to just the properties we want
		PropertyUtils.trim(p, includes, null);

		// Encrypt the property values
		PropertyUtils.encrypt(p, encryptor);

		// Update Maven with the encrypted values
		project.getProperties().putAll(p);
	}

	public String[] getProperties() {
		return properties;
	}

	public void setProperties(String[] properties) {
		this.properties = properties;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public MavenProject getProject() {
		return project;
	}
}
