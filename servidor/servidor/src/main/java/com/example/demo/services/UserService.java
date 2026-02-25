package com.example.demo.services;

import com.example.demo.models.UserLoginRequestDTO;
import com.example.demo.models.UserRegisterRequestDTO;

public interface UserService {
    boolean register(UserRegisterRequestDTO newUser);
    boolean login(UserLoginRequestDTO user);
}
