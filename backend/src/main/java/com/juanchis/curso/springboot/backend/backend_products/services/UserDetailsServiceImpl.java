package com.juanchis.curso.springboot.backend.backend_products.services;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.juanchis.curso.springboot.backend.backend_products.entities.User;
import com.juanchis.curso.springboot.backend.backend_products.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

        private final UserRepository userRepository;

        public UserDetailsServiceImpl(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado por email"));

                String role = user.getRole() != null ? user.getRole() : "ROLE_USER";
                List<GrantedAuthority> authorities = Collections.singletonList(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(role)
                );

                return new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                authorities);
        }
}
