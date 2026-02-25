package com.example.demo.services.implementation;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.models.UserEntity;
import com.example.demo.models.UserLoginRequestDTO;
import com.example.demo.models.UserRegisterRequestDTO;
import com.example.demo.services.UserService;

@Service
public class UserServiceImplementation implements UserService {
    private static List<UserEntity> userList = new ArrayList<UserEntity>();

    @Override
    public boolean register(UserRegisterRequestDTO newUser) {
        if (userList.stream().anyMatch(u -> newUser.getEmail().equalsIgnoreCase(u.getEmail()))) {
            System.out.println("Registration failed for " + newUser.getEmail() + ": email already in use");
            return false;
        }
        userList.add(new UserEntity(newUser.getName(), newUser.getEmail(), newUser.getPassword()));
        System.out.println("User registered: " + newUser.getEmail());
        return true;
    }

    @Override
    public boolean login(UserLoginRequestDTO user) {
        boolean found = userList.stream().anyMatch(u -> user.getEmail().equalsIgnoreCase(u.getEmail()) && user.getPassword().equals(u.getPassword()));
        System.out.println("Login attempt for " + user.getEmail() + ": " + (found ? "successful" : "failed"));
        return found;
    }

}
