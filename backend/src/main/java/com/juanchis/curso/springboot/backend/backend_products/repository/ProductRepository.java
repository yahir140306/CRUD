package com.juanchis.curso.springboot.backend.backend_products.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;
import com.juanchis.curso.springboot.backend.backend_products.entities.User;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByUser(User user, Pageable pageable);

    Optional<Product> findByIdAndUser(Long id, User user);
}
