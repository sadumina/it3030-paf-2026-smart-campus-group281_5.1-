package com.backend.backend.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleTokenVerifierService {

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    public GoogleUserInfo verifyIdToken(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                return null;
            }

            String audience = (String) response.get("aud");
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(audience)) {
                return null;
            }

            String emailVerified = String.valueOf(response.get("email_verified"));
            if (!"true".equalsIgnoreCase(emailVerified)) {
                return null;
            }

            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String sub = (String) response.get("sub");

            if (email == null || email.isBlank() || sub == null || sub.isBlank()) {
                return null;
            }

            return new GoogleUserInfo(sub, name == null || name.isBlank() ? email : name, email);
        } catch (RestClientException ex) {
            return null;
        }
    }

    public record GoogleUserInfo(String googleId, String name, String email) {
    }
}
