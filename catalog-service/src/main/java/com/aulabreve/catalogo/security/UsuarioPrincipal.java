package com.aulabreve.catalogo.security;

import com.aulabreve.catalogo.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/** Identidad estable para RF04/RF06/RF08 en la proxima etapa. */
public final class UsuarioPrincipal implements UserDetails {
    private final UUID id;
    private final String nombre;
    private final String email;
    private final String passwordHash;
    private final boolean activo;
    private final String rol;

    public UsuarioPrincipal(Usuario u) {
        this.id = u.getId();
        this.nombre = u.getNombre();
        this.email = u.getEmail();
        this.passwordHash = u.getPasswordHash();
        this.activo = u.isActivo();
        this.rol = u.getRol().name();
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol));
    }

    @Override
    public boolean isEnabled() { return activo; }
}
