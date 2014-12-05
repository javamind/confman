/**
 * Copyright (C) 2014 all@dev-mind.fr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
package com.ninjamind.confman.utils;

/**
 * Checker
 * @author Guillaume EHRET
 */
public class Preconditions {
    /**
     *
     * @param object
     * @param message
     * @throws NullPointerException
     */
    public static <T> T checkNotNull(T object, String message){
        if(object==null){
            throw new IllegalArgumentException(message);
        }
        return object;
    }

    /**
     * Ensures the truth of an expression involving the state of the calling instance, but not
     * involving any parameters to the calling method.
     *
     * @param expression a boolean expression
     * @throws IllegalStateException if {@code expression} is false
     */
    public static void checkState(boolean expression, String message) {
        if (!expression) {
            throw new IllegalStateException(message);
        }
    }
}
