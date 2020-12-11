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

---

**POST** /users

```json
{
  "auth": false,
  "payload": {
    "firstName": "min(1) max(50) required",
    "lastName": "min(1) max(50) required",
    "username": "min(3) max(30) required",
    "dateOfBirth": "max(new Date() - 1000 * 60 * 60 * 24 * 365 * 13) required",
    "email": "email@email.com required",
    "password": "min(6) regex(/[a-z]/) regex(/[A-Z]/) regex(/\\d+/) required"
  }
}
```

Examples:

- ```json
  {
    "payload": {
      "username": "already used username",
      "...": "..."
    },
    "status": 409,
    "response": {
      "statusCode": 409,
      "error": "Conflict",
      "message": "Username already in use"
    }
  }
  ```

- ```json
  {
    "payload": {
      "email": "already used email",
      "...": "..."
    },
    "status": 409,
    "response": {
      "statusCode": 409,
      "error": "Conflict",
      "message": "Email already in use"
    }
  }
  ```

- ```json
  {
    "payload": {
      "...": "..."
    },
    "status": 201,
    "response": {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "username": "...",
      "dateOfBirth": "...",
      "avatar": null,
      "email": "...",
      "emailVerified": false,
      "createdAt": "...",
      "newUser": true
    }
  }
  ```

---

**GET** /users/{userID}

```json
{
  "auth": true,
  "params": {
    "userId": "uuid"
  },
  "status": 200,
  "response": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "username": "...",
    "avatar": "..."
  }
}
```

---

**PUT** /users

```json
{
  "auth": true,
  "payload": {
    "key to update": "new value"
  },
  "status": 200,
  "response": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "username": "...",
    "dateOfBirth": "...",
    "avatar": null,
    "email": "...",
    "emailVerified": false,
    "createdAt": "...",
    "newUser": true
  }
}
```

Note: the same validation of `POST /users` is applied.

---

**DELETE** /users

```json
{
  "auth": true,
  "payload": {},
  "status": 204,
  "response": {}
}
```

Note: the user session will be removed after deleting the account

---

**GET** /users

```json
{
  "auth": true,
  "query": {
    "username": "min(1) required"
  },
  "response": [
    {
      "id": "...",
      "username": "...",
      "firstName": "...",
      "lastName": "...",
      "avatar": "..."
    },
    "..."
  ]
}
```

---

**POST** /users/friendRequests

```json
{
  "auth": true,
  "payload": {
    "requesteeId": "uuid required"
  },
  "status": 201,
  "response": {
    "userId": "requestee id",
    "user": {
      "id": "requester id",
      "username": "...",
      "firstName": "...",
      "lastName": "...",
      "avatar": "..."
    }
  }
}
```

Note: this will publish an event to the requestee

---

**DELETE** /users/friendRequests/{requesteeId}/cancel

```json
{
  "auth": true,
  "params": {
    "requesteeId": "uuid required"
  },
  "status": 200,
  "response": {
    "userId": "requestee id"
  }
}
```

Note: this will publish an event to the requestee

---

**DELETE** /users/friendRequests/{requesterId}/reject

```json
{
  "auth": true,
  "params": {
    "requester": "uuid required"
  },
  "status": 200,
  "response": {
    "userId": "requester id"
  }
}
```

Note: this will publish an event to the requester

---

**POST** /users/friends

**description:** accept friendship request

```json
{
  "auth": true,
  "payload": {
    "requesterId": "uuid required"
  },
  "status": 201,
  "response": {}
}
```

Note: this will publish an event to the requester and event for the requested

Examples:

- Event send to the one accepting the friendship request(requested)

```json
{
  "type": "ADD_FRIEND",
  "payload": {
    "userId": "d46b0dcd-d169-414e-8ba6-3c8d295304a8",
    "channelId": "a8b9c53d-8010-4d2b-93a7-9d56558da4bf",
    "type": "friend",
    "channel": {
      "id": "a8b9c53d-8010-4d2b-93a7-9d56558da4bf",
      "type": "friend",
      "name": null,
      "public": false,
      "createdAt": "2020-12-11T19:15:23.274705+02:00",
      "firstMessageId": null,
      "lastMessageId": null,
      "lastMessageAt": null,
      "status": "Ended",
      "queueStartPosition": 0,
      "videoStartTime": 0,
      "clockStartTime": "2020-12-11T19:15:23.274705+02:00",
      "members": [
        "987db161-8313-4dda-a49b-2d106b68c1c5",
        "d46b0dcd-d169-414e-8ba6-3c8d295304a8"
      ],
      "messages": [],
      "queue": []
    },
    "users": {
      "d46b0dcd-d169-414e-8ba6-3c8d295304a8": {
        "id": "d46b0dcd-d169-414e-8ba6-3c8d295304a8",
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "Ahmed97",
        "avatar": null
      },
      "987db161-8313-4dda-a49b-2d106b68c1c5": {
        "id": "987db161-8313-4dda-a49b-2d106b68c1c5",
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "tester",
        "avatar": null
      }
    },
    "messages": null
  }
}
```

- Event sent to the one who is being accepted(requester)

```json
{
  "type": "ADD_FRIEND",
  "payload": {
    "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
    "channelId": "a8b9c53d-8010-4d2b-93a7-9d56558da4bf",
    "type": "friend",
    "channel": {
      "id": "a8b9c53d-8010-4d2b-93a7-9d56558da4bf",
      "type": "friend",
      "name": null,
      "public": false,
      "createdAt": "2020-12-11T19:15:23.274705+02:00",
      "firstMessageId": null,
      "lastMessageId": null,
      "lastMessageAt": null,
      "status": "Ended",
      "queueStartPosition": 0,
      "videoStartTime": 0,
      "clockStartTime": "2020-12-11T19:15:23.274705+02:00",
      "members": [
        "987db161-8313-4dda-a49b-2d106b68c1c5",
        "d46b0dcd-d169-414e-8ba6-3c8d295304a8"
      ],
      "messages": [],
      "queue": []
    },
    "users": {
      "d46b0dcd-d169-414e-8ba6-3c8d295304a8": {
        "id": "d46b0dcd-d169-414e-8ba6-3c8d295304a8",
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "Ahmed97",
        "avatar": null
      },
      "987db161-8313-4dda-a49b-2d106b68c1c5": {
        "id": "987db161-8313-4dda-a49b-2d106b68c1c5",
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "tester",
        "avatar": null
      }
    },
    "messages": null
  }
}
```

---

**DELETE** /users/friends/{friendId}

**description:** deletes friend

```json
{
  "auth": true,
  "params": {
    "friendId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "userId": "deleted user id",
    "channelId": "channel id"
  }
}
```

Examples:

- request sent to `/users/friends/d46b0dcd-d169-414e-8ba6-3c8d295304a8`

- response

```json
{
  "userId": "d46b0dcd-d169-414e-8ba6-3c8d295304a8",
  "channelId": "ca791b8a-b8b6-4970-9560-1d06d6d9f7c9"
}
```

- Event sent to the deleted(two events)

```json
{
  "type": "DELETE_CHANNEL",
  "payload": {
    "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
    "channelId": "ca791b8a-b8b6-4970-9560-1d06d6d9f7c9"
  }
}
```

```json
{
  "type": "DELETE_FRIEND",
  "payload": {
    "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
    "channelId": "ca791b8a-b8b6-4970-9560-1d06d6d9f7c9"
  }
}
```

- Event sent to the one who is deleting

```json
{
  "type": "DELETE_CHANNEL",
  "payload": {
    "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
    "channelId": "ca791b8a-b8b6-4970-9560-1d06d6d9f7c9"
  }
}
```

---

**POST** /users/blocks

**description:** blocks user(not necessary a friend)

```json
{
  "auth": true,
  "payload": {
    "blockedId": "uuid required"
  },
  "status": 201,
  "response": {
    "userId": "blocked user id",
    "channelId": "channel id",
    "user": "info of blocked user"
  }
}
```

Example:

- request sent to `/users/blocks` with payload

```json
{
  "blockedId": "d46b0dcd-d169-414e-8ba6-3c8d295304a8"
}
```

- in case not a friend

  - response

  ```json
  { "userId": "d46b0dcd-d169-414e-8ba6-3c8d295304a8" }
  ```

  - event sent to the blocked user

  ```json
  {
    "type": "ADD_BLOCKER",
    "payload": { "userId": "987db161-8313-4dda-a49b-2d106b68c1c5" }
  }
  ```

- in case of a friend

  - response

  ```json
  {
    "userId": "d46b0dcd-d169-414e-8ba6-3c8d295304a8",
    "channelId": "b44d5bca-d5b7-4fdb-a23f-840db8a4c1aa"
  }
  ```

  - events sent to the blocked

  ```json
  {
    "type": "ADD_BLOCKER",
    "payload": {
      "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
      "channelId": "b44d5bca-d5b7-4fdb-a23f-840db8a4c1aa"
    }
  }
  ```

  ```json
  {
    "type": "DELETE_CHANNEL",
    "payload": {
      "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
      "channelId": "b44d5bca-d5b7-4fdb-a23f-840db8a4c1aa"
    }
  }
  ```

  - event sent to the blocker

  ```json
  {
    "type": "DELETE_CHANNEL",
    "payload": {
      "userId": "987db161-8313-4dda-a49b-2d106b68c1c5",
      "channelId": "b44d5bca-d5b7-4fdb-a23f-840db8a4c1aa"
    }
  }
  ```

---

**DELETE** /users/blocks/{blockedId}

**description:** removes blocked user

```json
{
  "auth": true,
  "params": {
    "blockedId": "uuid required"
  },
  "status": 200,
  "response": {
    "userId": "user id"
  }
}
```
