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
import java.util.Properties;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.project.MavenProject;
import org.kuali.common.util.PropertyUtils;

/**
 * @author <a href="mailto:zarars@gmail.com">Zarar Siddiqi</a>
 * @version $Id: AbstractWritePropertiesMojo.java 8861 2009-01-21 15:35:38Z pgier $
 */
public abstract class AbstractWritePropertiesMojo extends AbstractMojo {

	/**
	 * @parameter default-value="${project}"
	 * @required
	 * @readonly
	 */
	MavenProject project;

	/**
	 * The file that properties will be written to
	 *
	 * @parameter expression="${properties.outputFile}" default-value="${project.build.directory}/properties/project.properties";
	 * @required
	 */
	File outputFile;

	/**
	 * Either <code>NORMAL</code> or <code>ENVIRONMENT_VARIABLE</code>. When set to <code>ENVIRONMENT_VARIABLE</code> the keys in the
	 * properties file will all be upper case with periods replaced by underscores.
	 *
	 * @parameter expression="${properties.outputStyle}" default-value="NORMAL"
	 * @required
	 */
	OutputStyle outputStyle;

	/**
	 * If supplied property keys are prefixed with this value before being stored.
	 *
	 * @parameter expression="${properties.prefix}"
	 */
	String prefix;

	/**
	 * The encoding to use when storing the properties
	 *
	 * @parameter expression="${properties.encoding}" default-value="${project.build.sourceEncoding}"
	 */
	String encoding;

	/**
	 * Anything provided here is added as a comment at the top of the properties file.
	 *
	 * @parameter expression="${properties.comment}"
	 */
	String comment;

	protected void writeProperties(File file, Properties properties, OutputStyle outputStyle, String prefix, String encoding, String comment) {
		Properties prefixed = PropertyUtils.getPrefixedProperties(properties, prefix);
		Properties formatted = getFormattedProperties(prefixed, outputStyle);
		PropertyUtils.store(formatted, file, encoding, comment);
	}

	protected Properties getFormattedProperties(Properties properties, OutputStyle style) {
		switch (style) {
		case NORMAL:
			return properties;
		case ENVIRONMENT_VARIABLE:
			return PropertyUtils.reformatKeysAsEnvVars(properties);
		default:
			throw new IllegalArgumentException(outputStyle + " is unknown");
		}
	}

	public MavenProject getProject() {
		return project;
	}

	public File getOutputFile() {
		return outputFile;
	}

	public void setOutputFile(File outputFile) {
		this.outputFile = outputFile;
	}

	public OutputStyle getOutputStyle() {
		return outputStyle;
	}

	public void setOutputStyle(OutputStyle outputStyle) {
		this.outputStyle = outputStyle;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public String getEncoding() {
		return encoding;
	}

	public void setEncoding(String encoding) {
		this.encoding = encoding;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}
}
