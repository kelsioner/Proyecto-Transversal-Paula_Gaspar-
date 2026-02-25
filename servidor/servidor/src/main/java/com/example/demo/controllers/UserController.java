package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.UserLoginRequestDTO;
import com.example.demo.models.UserRegisterRequestDTO;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/login")
    public boolean login(@RequestBody UserLoginRequestDTO loginRequestDTO) {
        return userService.login(loginRequestDTO);
    }

    @PostMapping("/register")
    public boolean register(@RequestBody UserRegisterRequestDTO registerRequestDTO) {
        return userService.register(registerRequestDTO);
    }
}
