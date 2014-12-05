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

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;
import org.jasypt.util.text.TextEncryptor;
import org.kuali.common.util.EncUtils;
import org.kuali.common.util.PropertyUtils;

/**
 * Any system, environment, or Maven properties ending with .encrypted are decrypted and stored as Maven properties under a new property key with the .encrypted suffix trimmed off.
 * 
 * @goal decryptall
 */
public class DecryptAllPropertiesMojo extends AbstractMojo {

	/**
	 * @parameter default-value="${project}"
	 * @required
	 * @readonly
	 */
	private MavenProject project;

	/**
	 * The pattern for matching properties in need of decryption
	 * 
	 * @parameter expression="${properties.endsWith}" default-value=".encrypted"
	 * @required
	 */
	private String endsWith;

	/**
	 * The password for decrypting property values. This same password must have been used to encrypt them.
	 * 
	 * @parameter expression="${properties.password}"
	 * @required
	 */
	private String password;

	@Override
	public void execute() throws MojoExecutionException {
		TextEncryptor encryptor = EncUtils.getTextEncryptor(password);
		Properties props = PropertyUtils.getGlobalProperties(project.getProperties());
		List<String> keys = PropertyUtils.getEndsWithKeys(props, endsWith);
		for (String key : keys) {
			String value = props.getProperty(key);
			String decryptedValue = getDecryptedValue(encryptor, value);
			int length = endsWith.length();
			String newKey = key.substring(0, key.length() - length);
			project.getProperties().setProperty(newKey, decryptedValue);
		}
	}

	protected String getDecryptedValue(TextEncryptor encryptor, String value) {
		if (PropertyUtils.isEncryptedPropertyValue(value)) {
			return PropertyUtils.decryptPropertyValue(encryptor, value);
		} else {
			// Some legacy .encrypted properties don't follow the ENC(...) syntax for property values
			return encryptor.decrypt(value);
		}
	}

	public MavenProject getProject() {
		return project;
	}

	public void setProject(MavenProject project) {
		this.project = project;
	}

	public String getEndsWith() {
		return endsWith;
	}

	public void setEndsWith(String endsWith) {
		this.endsWith = endsWith;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
