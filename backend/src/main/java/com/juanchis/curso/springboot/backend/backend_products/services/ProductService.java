package com.juanchis.curso.springboot.backend.backend_products.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;

public interface ProductService {

    Page<Product> findAllForCurrentUser(Pageable pageable);

    Product findByIdForCurrentUser(Long id);

    Product createForCurrentUser(Product product);

    Product updateForCurrentUser(Long id, Product product);

    Product deleteForCurrentUser(Long id);
}
