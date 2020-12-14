**POST** /sessions/login

```json
{
  "auth": "false",
  "payload": {
    "usernameOrEmail": "required",
    "password": "required"
  }
}
```

Examples:

- ```json
  {
    "payload": {
      "usernameOrEmail": "",
      "password": ""
    },
    "status": 400,
    "response": {
      "statusCode": 400,
      "error": "Bad Request",
      "message": "Invalid Request",
      "details": {
        "usernameOrEmail": "\"usernameOrEmail\" is not allowed to be empty",
        "password": "\"password\" is not allowed to be empty"
      }
    }
  }
  ```

- ```json
  {
    "payload": {
      "usernameOrEmail": "wrong email",
      "password": "wrong password"
    },
    "status": 401,
    "response": {
      "statusCode": 401,
      "error": "Unauthorized",
      "message": "Incorrect username or password."
    }
  }
  ```

- ```json
  {
    "payload": {
      "usernameOrEmail": "right email",
      "password": "right password"
    },
    "status": 200,
    "response": {
      "id": "87352556-fc8a-4462-ab16-8aa9b12f4df0",
      "firstName": "someone",
      "lastName": "someone",
      "username": "someone",
      "dateOfBirth": "1900-1-1T00:00:00.000Z",
      "avatar": null,
      "email": "email@email.email",
      "emailVerified": false,
      "createdAt": "1900-1-1T00:00:00.000Z",
      "channels": {
        "513c1c17-3cf4-473b-8248-fc3c11691548": {
          "id": "513c1c17-3cf4-473b-8248-fc3c11691548",
          "type": "self",
          "name": null,
          "description": null,
          "icon": null,
          "public": false,
          "ownerId": null,
          "createdAt": "1900-1-1T20:08:08.777485+00:00",
          "firstMessageId": null,
          "lastMessageId": null,
          "lastMessageAt": null,
          "lastMessageUsername": null,
          "lastMessageContent": null,
          "members": ["87352556-fc8a-4462-ab16-8aa9b12f4df0"],
          "chatNotifications": null,
          "viewers": []
        }
      },
      "relationships": {
        "friends": [],
        "sentFriendRequests": [],
        "receivedFriendRequests": [],
        "blocked": [],
        "blockers": []
      },
      "users": {
        "87352556-fc8a-4462-ab16-8aa9b12f4df0": {
          "username": "someone",
          "firstName": "someone",
          "lastName": "someone",
          "avatar": null
        }
      },
      "wsTicket": "10f28775-4459-47e4-822c-89f3c6c76704"
    }
  }
  ```

---

**POST** /sessions/logout

```json
{
  "auth": true,
  "payload": {},
  "status": 204,
  "response": {}
}
```

---

**GET** /sessions/refresh

```json
{
  "auth": true
}
```

Examples:

```json
{
  "status": 200,
  "response": {
    "id": "87352556-fc8a-4462-ab16-8aa9b12f4df0",
    "firstName": "someone",
    "lastName": "someone",
    "username": "someone",
    "dateOfBirth": "1900-1-1T00:00:00.000Z",
    "avatar": null,
    "email": "email@email.email",
    "emailVerified": false,
    "createdAt": "1900-1-1T00:00:00.000Z",
    "channels": {
      "513c1c17-3cf4-473b-8248-fc3c11691548": {
        "id": "513c1c17-3cf4-473b-8248-fc3c11691548",
        "type": "self",
        "name": null,
        "description": null,
        "icon": null,
        "public": false,
        "ownerId": null,
        "createdAt": "1900-1-1T20:08:08.777485+00:00",
        "firstMessageId": null,
        "lastMessageId": null,
        "lastMessageAt": null,
        "lastMessageUsername": null,
        "lastMessageContent": null,
        "members": ["87352556-fc8a-4462-ab16-8aa9b12f4df0"],
        "chatNotifications": null,
        "viewers": []
      }
    },
    "relationships": {
      "friends": [],
      "sentFriendRequests": [],
      "receivedFriendRequests": [],
      "blocked": [],
      "blockers": []
    },
    "users": {
      "87352556-fc8a-4462-ab16-8aa9b12f4df0": {
        "username": "someone",
        "firstName": "someone",
        "lastName": "someone",
        "avatar": null
      }
    },
    "wsTicket": "10f28775-4459-47e4-822c-89f3c6c76704"
  }
}
```

---

**GET** /sessions/validate

```json
{
  "auth": true
}
```

Examples:

```json
{
  "status": 200,
  "response": {
    "id": "87352556-fc8a-4462-ab16-8aa9b12f4df0",
    "firstName": "someone",
    "lastName": "someone",
    "username": "someone",
    "dateOfBirth": "1900-1-1T00:00:00.000Z",
    "avatar": null,
    "email": "email@email.email",
    "emailVerified": false,
    "createdAt": "1900-1-1T00:00:00.000Z",
    "channels": {
      "513c1c17-3cf4-473b-8248-fc3c11691548": {
        "id": "513c1c17-3cf4-473b-8248-fc3c11691548",
        "type": "self",
        "name": null,
        "description": null,
        "icon": null,
        "public": false,
        "ownerId": null,
        "createdAt": "1900-1-1T20:08:08.777485+00:00",
        "firstMessageId": null,
        "lastMessageId": null,
        "lastMessageAt": null,
        "lastMessageUsername": null,
        "lastMessageContent": null,
        "members": ["87352556-fc8a-4462-ab16-8aa9b12f4df0"],
        "chatNotifications": null,
        "viewers": []
      }
    },
    "relationships": {
      "friends": [],
      "sentFriendRequests": [],
      "receivedFriendRequests": [],
      "blocked": [],
      "blockers": []
    },
    "users": {
      "87352556-fc8a-4462-ab16-8aa9b12f4df0": {
        "username": "someone",
        "firstName": "someone",
        "lastName": "someone",
        "avatar": null
      }
    },
    "wsTicket": "10f28775-4459-47e4-822c-89f3c6c76704"
  }
}
```
