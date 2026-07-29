package com.juanchis.curso.springboot.backend.backend_products.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.juanchis.curso.springboot.backend.backend_products.entities.User;
import com.juanchis.curso.springboot.backend.backend_products.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        if (role == null || (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_USER") && !role.equals("ROLE_OWNER"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        
        // Regla de negocio: Nadie puede quitarle los permisos al Dueño Creador
        if (user.getRole() != null && user.getRole().equals("ROLE_OWNER") && !role.equals("ROLE_OWNER")) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes modificar al Dueño del sistema");
        }

        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
