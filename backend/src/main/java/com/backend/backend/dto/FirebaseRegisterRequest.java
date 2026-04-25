package com.backend.backend.dto;

/**
 * Firebase Register Request DTO
 */
public class FirebaseRegisterRequest {
    private String firebaseUid;
    private String email;
    private String name;

    public FirebaseRegisterRequest() {}

    public FirebaseRegisterRequest(String firebaseUid, String email, String name) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.name = name;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
