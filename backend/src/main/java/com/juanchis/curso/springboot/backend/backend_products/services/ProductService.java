package com.juanchis.curso.springboot.backend.backend_products.services;

import java.util.List;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;

public interface ProductService {

    List<Product> findAllForCurrentUser();

    Product findByIdForCurrentUser(Long id);

    Product createForCurrentUser(Product product);

    Product updateForCurrentUser(Long id, Product product);

    Product deleteForCurrentUser(Long id);
}
