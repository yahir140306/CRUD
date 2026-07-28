package com.juanchis.curso.springboot.backend.backend_products.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;
import com.juanchis.curso.springboot.backend.backend_products.entities.User;

public interface ProductRepository extends CrudRepository<Product, Long> {
    List<Product> findByUser(User user);

    Optional<Product> findByIdAndUser(Long id, User user);
}
