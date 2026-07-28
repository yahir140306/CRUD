package com.juanchis.curso.springboot.backend.backend_products.services;

import java.util.List;

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
    public List<Product> findAllForCurrentUser() {
        User user = authService.getAuthenticatedUser();
        return productRepository.findByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Product findByIdForCurrentUser(Long id) {
        User user = authService.getAuthenticatedUser();
        return productRepository.findByIdAndUser(id, user)
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
        User user = authService.getAuthenticatedUser();
        productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "No tienes permiso para editar este producto"));

        product.setId(id);
        product.setUser(user);
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product deleteForCurrentUser(Long id) {
        User user = authService.getAuthenticatedUser();
        Product product = productRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "No tienes permiso para eliminar este producto"));

        productRepository.delete(product);
        return product;
    }
}
