package com.juanchis.curso.springboot.backend.backend_products.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.juanchis.curso.springboot.backend.backend_products.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
