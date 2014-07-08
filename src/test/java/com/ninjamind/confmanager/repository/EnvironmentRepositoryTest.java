package com.ninjamind.confmanager.repository;

import com.ninjamind.confmanager.config.PersistenceConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.sql.DataSource;

/**
 * Le principe de cette classe
 *
 * @author EHRET_G
 */
@ContextConfiguration(classes = {PersistenceConfig.class})
@RunWith(SpringJUnit4ClassRunner.class)
public class EnvironmentRepositoryTest {
    @Autowired
    private DataSource dataSource;

    @Before
    public void setUp(){

    }

    @Test
    public void test() {

    }
}
