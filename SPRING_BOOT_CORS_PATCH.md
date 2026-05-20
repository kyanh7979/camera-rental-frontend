# ============================================================
# SPRING BOOT CORS + SECURITY PATCH
# camera-rental-backend
# ============================================================
# Apply these changes to your existing:
#   1. SecurityConfig.java
#   2. WebConfig.java (if you have one)
#   3. application.yml / application.properties
#
# DO NOT delete JWT filter — CORS patch only adds origins
# ============================================================

# ============================================================
# FILE 1: src/main/resources/application.yml (or .properties)
# ============================================================
# Add this at the bottom of application.yml:
# (If you already have app.cors section, REPLACE it entirely)

# ============================================================
# FILE 2: src/main/java/com/example/config/SecurityConfig.java
# ============================================================
# Find your @Bean SecurityFilterChain method and update it.
# Find your CorsConfigurationSource @Bean and update it.
#
# Below is the FULL replacement — copy everything after the
# package declaration and keep your existing imports/annotations.
# ============================================================


# ============================================================
# COPY FROM HERE DOWNWARD INTO SecurityConfig.java
# (Keep your existing package + imports)
# ============================================================

/*
REPLACE your existing SecurityConfig.java content with this:
(Keep your package declaration, keep ALL existing imports,
keep @Configuration/@EnableWebSecurity annotations,
keep any existing @Bean methods you have — ONLY replace
the two methods below: securityFilterChain and corsConfigurationSource)
*/

--- BEGIN SecurityConfig.java ---
package com.example.config;  // <-- UPDATE to your actual package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // <<< KEEP your existing JwtAuthenticationFilter import + field + constructor >>>

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow public endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/api/cameras/**",
                    "/api/ai/status",
                    "/api/ai/chat",
                    "/api/banners/home",
                    "/api/banners/home/primary",
                    "/api/payos/**",
                    "/api/payment/payos/**",
                    "/api/reviews/camera/**",
                    "/api/orders/payment-return/**",
                    "/uploads/**",
                    "/api/auth/reset-password"
                ).permitAll()
                // Admin endpoints require authentication
                .requestMatchers("/api/admin/**").authenticated()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            // <<< KEEP your existing JWT filter registration — do NOT remove this line >>>
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // --- Allowed Origins ---
        // PRODUCTION: Vercel frontend URLs
        configuration.setAllowedOriginPatterns(List.of(
            "https://camera-rental-frontend.vercel.app",
            "https://camera-rental-frontend-*.vercel.app"
        ));

        // DEVELOPMENT: Localhost
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));

        // --- Allowed Methods ---
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // --- Allowed Headers ---
        // "*"" not allowed when allowCredentials=true
        // List specific headers explicitly
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "Cache-Control"
        ));

        // --- Expose Headers ---
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));

        // --- Credentials ---
        configuration.setAllowCredentials(true);

        // --- Preflight cache ---
        configuration.setMaxAge(3600L);

        // --- Apply to all paths ---
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
--- END SecurityConfig.java ---


# ============================================================
# ALTERNATIVE: If you have a SEPARATE WebConfig.java
# ============================================================
# Some projects use a dedicated WebConfig for CORS instead of
# putting it in SecurityConfig. If that's your case, replace
# WebConfig.java with this instead:
# ============================================================

--- BEGIN WebConfig.java ---
package com.example.config;  // <-- UPDATE to your actual package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns(
                "https://camera-rental-frontend.vercel.app",
                "https://camera-rental-frontend-*.vercel.app"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Access-Control-Allow-Origin")
            .allowCredentials(true)
            .maxAge(3600L);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "https://camera-rental-frontend.vercel.app",
            "https://camera-rental-frontend-*.vercel.app"
        ));
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Requested-With",
            "Accept", "Origin", "Access-Control-Request-Method",
            "Access-Control-Request-Headers", "Cache-Control"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Authorization"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
--- END WebConfig.java ---


# ============================================================
# IMPORTANT NOTES
# ============================================================

# 1. CREDENTIALS REQUIREMENTS
# When setAllowCredentials(true):
#   - CANNOT use allowedOrigins("*") → use allowedOriginPatterns instead
#   - CANNOT use allowedHeaders("*") → must list headers explicitly
#   - Frontend must include: credentials: 'include' in fetch
#                           or: withCredentials: true in axios
#
# Your frontend api.js ALREADY has credentials — the axios
# interceptor adds Authorization header, and browsers send cookies.
# So setAllowCredentials(true) is CORRECT and must stay.

# 2. JWT FILTER STAYS
# The JwtAuthenticationFilter (or JwtAuthFilter) registration
# in SecurityConfig must NOT be removed:
#   .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
# This line ensures JWT authentication still works after CORS fix.

# 3. OPTIONS PREFLIGHT
# Spring Security must NOT block OPTIONS requests.
# By adding .cors(cors -> cors.configurationSource(...)) to HttpSecurity,
# the CORS filter runs BEFORE security filters, so OPTIONS is handled
# before JWT validation. This fixes the preflight 401/403 error.

# 4. DEPLOYMENT
# After applying this patch, redeploy your backend on Render.
# The CORS config is in Java code, not environment variables,
# so changes require a new build + deploy.

# 5. TESTING
# After redeploy, test:
#   curl -v -X OPTIONS \
#     -H "Origin: https://camera-rental-frontend.vercel.app" \
#     -H "Access-Control-Request-Method: GET" \
#     https://camera-rental-backend-2hz8.onrender.com/api/cameras
#
# Expected: 200 OK with headers:
#   Access-Control-Allow-Origin: https://camera-rental-frontend.vercel.app
#   Access-Control-Allow-Credentials: true
#   Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
