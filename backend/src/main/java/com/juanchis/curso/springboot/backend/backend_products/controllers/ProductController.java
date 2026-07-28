package com.juanchis.curso.springboot.backend.backend_products.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.juanchis.curso.springboot.backend.backend_products.entities.Product;
import com.juanchis.curso.springboot.backend.backend_products.services.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> list() {
        return ResponseEntity.ok(productService.findAllForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> view(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findByIdForCurrentUser(id));
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        Product savedProduct = productService.createForCurrentUser(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateForCurrentUser(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Product> delete(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deleteForCurrentUser(id));
    }
}
