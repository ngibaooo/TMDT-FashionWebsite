package com.tmdt.fashion_shop.config;
import com.tmdt.fashion_shop.security.JWTAuthFilter;
import com.tmdt.fashion_shop.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JWTAuthFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf().disable()
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/auth/**").permitAll()
//                        .requestMatchers("/api/products/**").permitAll()
//                        .requestMatchers("/api/products/admin/**").hasRole("ADMIN")
//                        .requestMatchers("/api/cart/**").authenticated()
//                        .requestMatchers("/api/orders/**").authenticated()
//                        .requestMatchers("/api/users/**").authenticated()
//                        .requestMatchers("/api/vouchers/**").authenticated()
//                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                        .anyRequest().permitAll()
//                )
//                .oauth2Login(oauth -> oauth
////                        .successHandler(oAuth2SuccessHandler) // THÊM DÒNG NÀY
//                        .loginPage("/login")
//                )
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/login", "/register", "/css/**", "/js/**", "/images/**").permitAll()
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/products/**").permitAll()
                    .requestMatchers("/api/products/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/cart/**").authenticated()
                    .requestMatchers("/api/orders/**").authenticated()
                    .requestMatchers("/api/users/**").authenticated()
                    .requestMatchers("/api/vouchers/**").authenticated()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().permitAll()
            )

            // 🔥 THÊM CÁI NÀY (QUAN TRỌNG)
            .formLogin(form -> form
                    .loginPage("/login")
                    .permitAll()
            )

            // 🔥 OAuth2 login
            .oauth2Login(oauth -> oauth
                    .loginPage("/login")
                    .successHandler(oAuth2SuccessHandler) // bật lại nếu bạn dùng
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
}