package com.ninjamind.confman.web.app;

import com.ninjamind.confman.domain.User;
import com.ninjamind.confman.dto.UserDto;
import com.ninjamind.confman.service.ApplicationFacade;
import com.ninjamind.confman.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Rest API for {@link com.ninjamind.confman.domain.User}
 *
 * @author Guillaume EHRET
 */
@RestController
@RequestMapping(value = "/app/user")
public class UserController extends AbstractConfmanController<User, UserDto, String>{

    @Autowired
    private ApplicationFacade applicationFacade;

    @Autowired
    public UserController(UserService genericFacade) {
        super(genericFacade, UserDto.class, User.class);
    }


    /**
     * @return one entity by its identifiant
     */
    @RequestMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UserDto get(@PathVariable String id) {
        User dto = genericFacade.findOne(id);
        //dto.setLabel("spring-loaded");
        return convertToDto(dto);
    }

}
