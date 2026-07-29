package com.juanchis.curso.springboot.backend.backend_products.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;
import com.juanchis.curso.springboot.backend.backend_products.entities.User;
import com.juanchis.curso.springboot.backend.backend_products.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final AuthService authService;

    public ProductServiceImpl(ProductRepository productRepository, AuthService authService) {
        this.productRepository = productRepository;
        this.authService = authService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findAllForCurrentUser(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Product findByIdForCurrentUser(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    @Override
    @Transactional
    public Product createForCurrentUser(Product product) {
        User user = authService.getAuthenticatedUser();
        product.setUser(user);
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateForCurrentUser(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        product.setId(id);
        product.setUser(existing.getUser()); // Conservar el usuario original que lo creó
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product deleteForCurrentUser(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        productRepository.delete(product);
        return product;
    }
}
