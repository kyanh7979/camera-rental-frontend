# ============================================================
# SPRING BOOT CORS + SECURITY PATCH
# camera-rental-backend
# ============================================================
# Apply to: SecurityConfig.java (or WebConfig.java if separate)
# DO NOT delete JWT filter — CORS patch only adds origins
# DO NOT create duplicate CORS beans
# ============================================================


# ============================================================
# SECTION 1: Find your SecurityConfig.java
# ============================================================
# Look in your backend project for:
#   src/main/java/com/example/config/SecurityConfig.java
#   or: src/main/java/com/lensrent/config/SecurityConfig.java
#   or similar package under src/main/java
#
# DO NOT create a new file — modify the existing SecurityConfig.java
# ============================================================


# ============================================================
# SECTION 2: What to do in SecurityConfig.java
# ============================================================
# You need to do ALL THREE of these inside your existing
# SecurityConfig.java file:
#
#   A. ADD @Bean CorsConfigurationSource method
#      (if it doesn't already exist)
#
#   B. UPDATE @Bean SecurityFilterChain to call .cors(...)
#      AND add OPTIONS /** permitAll BEFORE other matchers
#
#   C. ENSURE @EnableWebSecurity is present on the class
#      (it usually already is — don't remove it)
#
# Keep ALL existing code: JWT filter registration, endpoint matchers,
# other beans. Only add/modify CORS parts below.
# ============================================================


# ============================================================
# SECTION 3: Step-by-step patch instructions
# ============================================================
#
# STEP 1: Add these imports to SecurityConfig.java if not already present:
#
# import org.springframework.web.cors.CorsConfiguration;
# import org.springframework.web.cors.CorsConfigurationSource;
# import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
# import java.util.Arrays;
# import java.util.List;
#
# STEP 2: Add this @Bean method to SecurityConfig.java:
#          (place it alongside your other @Bean methods)
#
# STEP 3: In your existing securityFilterChain method, FIND the line
#          that configures HttpSecurity and ADD .cors(cors -> ...) at the start:
#
#          http
#              .cors(cors -> cors.configurationSource(corsConfigurationSource()))
#              .csrf(csrf -> csrf.disable())
#              ...
#
# STEP 4: In your existing authorizeHttpRequests block, ADD this as the
#          FIRST .requestMatchers line (BEFORE all other matchers):
#
#          .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
#
#          This ensures OPTIONS preflight requests pass through without JWT check.
#
# STEP 5: Do NOT remove your existing JWT filter registration:
#          .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
# ============================================================


# ============================================================
# SECTION 4: Copy this @Bean method into SecurityConfig.java
# ============================================================
# Place this method inside your SecurityConfig class,
# alongside other @Bean methods you already have.
# Do NOT put it inside another method.

--- BEGIN CORS_BEAN ---

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // PRODUCTION: Vercel production + all preview domains
        // *.vercel.app matches:
        //   camera-rental-frontend.vercel.app
        //   camera-rental-frontend-abc123.vercel.app
        //   camera-rental-frontend-p9h9ues9m-lekyanh1110-4706s-projects.vercel.app
        //   etc.
        configuration.setAllowedOriginPatterns(List.of(
            "https://*.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000"
        ));

        // Credentials: required for Authorization header + cookies
        configuration.setAllowCredentials(true);

        // Methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // All headers
        configuration.setAllowedHeaders(List.of("*"));

        // Expose headers so frontend can read them
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));

        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);

        // Apply to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

--- END CORS_BEAN ---


# ============================================================
# SECTION 5: Updated securityFilterChain template
# ============================================================
# Your securityFilterChain method should look like this.
# Keep your existing endpoint matchers (the ones with .permitAll()).
# Keep your JWT filter registration.
# Just add .cors(...) at the start and OPTIONS permitAll at the top.

--- BEGIN securityFilterChain_Template ---

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS — this MUST be first, before any security filters
            // CORS filter will handle OPTIONS before JWT filter sees it
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // OPTIONS preflight — MUST be first to bypass JWT for preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // --- Your existing permitAll endpoints ---
                // (keep these exactly as they are)
                // .requestMatchers("/api/auth/**").permitAll()
                // .requestMatchers("/api/cameras/**").permitAll()
                // .requestMatchers("/api/banners/home").permitAll()
                // etc.

                // Admin endpoints require authentication
                // .requestMatchers("/api/admin/**").authenticated()

                // All other requests require authentication
                .anyRequest().authenticated()
            )
            // <<< KEEP YOUR EXISTING JWT FILTER REGISTRATION — do NOT remove this >>>
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

--- END securityFilterChain_Template ---


# ============================================================
# SECTION 6: Example — BEFORE and AFTER SecurityConfig.java
# ============================================================
# BEFORE (what your file probably looks like now):
#
# @Configuration
# @EnableWebSecurity
# public class SecurityConfig {
#
#     private final JwtAuthenticationFilter jwtAuthenticationFilter;
#
#     @Bean
#     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
#         http
#             .csrf(csrf -> csrf.disable())
#             .sessionManagement(session ->
#                 session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
#             .authorizeHttpRequests(auth -> auth
#                 .requestMatchers("/api/auth/**").permitAll()
#                 .requestMatchers("/api/cameras/**").permitAll()
#                 .requestMatchers("/api/admin/**").authenticated()
#                 .anyRequest().authenticated()
#             )
#             .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
#
#         return http.build();
#     }
# }
#
# AFTER (what it should look like after applying this patch):
#
# @Configuration
# @EnableWebSecurity
# public class SecurityConfig {
#
#     private final JwtAuthenticationFilter jwtAuthenticationFilter;
#
#     // ADD THIS BEAN
#     @Bean
#     public CorsConfigurationSource corsConfigurationSource() {
#         CorsConfiguration configuration = new CorsConfiguration();
#         configuration.setAllowedOriginPatterns(List.of(
#             "https://*.vercel.app",
#             "http://localhost:5173",
#             "http://localhost:3000"
#         ));
#         configuration.setAllowCredentials(true);
#         configuration.setAllowedMethods(Arrays.asList(
#             "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
#         ));
#         configuration.setAllowedHeaders(List.of("*"));
#         configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
#         configuration.setMaxAge(3600L);
#         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
#         source.registerCorsConfiguration("/**", configuration);
#         return source;
#     }
#
#     @Bean
#     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
#         http
#             // ADD THIS LINE at the start
#             .cors(cors -> cors.configurationSource(corsConfigurationSource()))
#             .csrf(csrf -> csrf.disable())
#             .sessionManagement(session ->
#                 session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
#             .authorizeHttpRequests(auth -> auth
#                 // ADD THIS LINE as the FIRST matcher
#                 .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
#                 // Keep all your existing matchers below
#                 .requestMatchers("/api/auth/**").permitAll()
#                 .requestMatchers("/api/cameras/**").permitAll()
#                 .requestMatchers("/api/admin/**").authenticated()
#                 .anyRequest().authenticated()
#             )
#             .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
#
#         return http.build();
#     }
# }


# ============================================================
# SECTION 7: If you already have a CorsConfigurationSource bean
# ============================================================
# If your SecurityConfig.java ALREADY has a corsConfigurationSource()
# method, just UPDATE it with the values above.
# Do NOT create a second bean — update the existing one.
#
# Key things that must be set correctly:
#   setAllowedOriginPatterns(...)  ← use THIS, not setAllowedOrigins with "*"
#   setAllowCredentials(true)
#   setAllowedHeaders(List.of("*"))


# ============================================================
# SECTION 8: If you use a SEPARATE WebConfig.java
# ============================================================
# If your project has WebConfig.java (implements WebMvcConfigurer)
# instead of CORS in SecurityConfig, apply the same changes there.
#
# Example WebConfig.java:
#
# package com.example.config;
#
# import org.springframework.context.annotation.Bean;
# import org.springframework.context.annotation.Configuration;
# import org.springframework.web.cors.CorsConfiguration;
# import org.springframework.web.cors.CorsConfigurationSource;
# import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
# import org.springframework.web.servlet.config.annotation.CorsRegistry;
# import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
# import java.util.Arrays;
# import java.util.List;
#
# @Configuration
# public class WebConfig implements WebMvcConfigurer {
#
#     @Override
#     public void addCorsMappings(CorsRegistry registry) {
#         registry.addMapping("/**")
#             .allowedOriginPatterns("https://*.vercel.app")
#             .allowedOrigins("http://localhost:5173", "http://localhost:3000")
#             .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
#             .allowedHeaders("*")
#             .exposedHeaders("Authorization", "Content-Type")
#             .allowCredentials(true)
#             .maxAge(3600L);
#     }
#
#     @Bean
#     public CorsConfigurationSource corsConfigurationSource() {
#         CorsConfiguration configuration = new CorsConfiguration();
#         configuration.setAllowedOriginPatterns(List.of("https://*.vercel.app"));
#         configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
#         configuration.setAllowCredentials(true);
#         configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
#         configuration.setAllowedHeaders(List.of("*"));
#         configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
#         configuration.setMaxAge(3600L);
#         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
#         source.registerCorsConfiguration("/**", configuration);
#         return source;
#     }
# }


# ============================================================
# VERIFY AFTER APPLYING
# ============================================================
# After applying, redeploy your backend on Render.
#
# Test from terminal:
#   curl -v -X OPTIONS \
#     -H "Origin: https://camera-rental-frontend.vercel.app" \
#     -H "Access-Control-Request-Method: GET" \
#     -H "Access-Control-Request-Headers: Authorization,Content-Type" \
#     https://camera-rental-backend-2hz8.onrender.com/api/cameras
#
# Expected response:
#   HTTP/2 200
#   access-control-allow-origin: https://camera-rental-frontend.vercel.app
#   access-control-allow-credentials: true
#   access-control-allow-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
#   access-control-allow-headers: *
#   access-control-max-age: 3600
