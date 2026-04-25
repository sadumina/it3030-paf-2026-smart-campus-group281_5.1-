# Local Backend Startup

The backend needs a reachable MongoDB instance before Spring Boot can create `mongoTemplate` and start the application.

## Recommended startup

From the `backend` folder:

```powershell
.\start-dev.ps1
```

What it does:

- Starts normally if local MongoDB is available on `localhost:27017`
- Stops early with a clear message if MongoDB is not running
- Supports Atlas with:

```powershell
.\start-dev.ps1 -Atlas
```

## Connection modes

### Local MongoDB

Default config in `src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/edusense}
```

### MongoDB Atlas

Opt-in profile in `src/main/resources/application-atlas.properties`:

```powershell
$env:SPRING_PROFILES_ACTIVE="atlas"
.\mvnw.cmd spring-boot:run
```

You can also override either mode with:

```powershell
$env:MONGODB_URI="<your-connection-string>"
.\mvnw.cmd spring-boot:run
```
