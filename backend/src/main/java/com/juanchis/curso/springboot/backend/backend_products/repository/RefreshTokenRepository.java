package com.juanchis.curso.springboot.backend.backend_products.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.juanchis.curso.springboot.backend.backend_products.entities.RefreshToken;
import com.juanchis.curso.springboot.backend.backend_products.entities.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    int deleteByUser(User user);
}
