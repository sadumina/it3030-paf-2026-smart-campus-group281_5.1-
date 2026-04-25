package com.backend.backend.dto;

/**
 * Firebase Login Request DTO
 */
public class FirebaseLoginRequest {
    private String firebaseUid;
    private String email;
    private String idToken;

    public FirebaseLoginRequest() {}

    public FirebaseLoginRequest(String firebaseUid, String email, String idToken) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.idToken = idToken;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
