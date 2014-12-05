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

import java.util.Iterator;
import java.util.List;
import java.util.Properties;

import org.apache.maven.model.Profile;
import org.apache.maven.plugin.MojoExecutionException;

/**
 * Writes properties of all active profiles to a file.
 *
 * @author <a href="mailto:zarars@gmail.com">Zarar Siddiqi</a>
 * @version $Id: WriteActiveProfileProperties.java 8861 2009-01-21 15:35:38Z pgier $
 * @goal write-active-profile-properties
 */
public class WriteActiveProfileProperties extends AbstractWritePropertiesMojo {
	@Override
	public void execute() throws MojoExecutionException {
		List<?> list = project.getActiveProfiles();
		if (getLog().isInfoEnabled()) {
			getLog().debug(list.size() + " profile(s) active");
		}
		Properties properties = new Properties();
		for (Iterator<?> iter = list.iterator(); iter.hasNext();) {
			Profile profile = (Profile) iter.next();
			if (profile.getProperties() != null) {
				properties.putAll(profile.getProperties());
			}
		}

		getLog().info("Creating " + outputFile);
		writeProperties(outputFile, properties, outputStyle, prefix, encoding, comment);
	}
}
