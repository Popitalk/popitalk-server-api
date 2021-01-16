**POST** /members/{channelId}

**description** add member(user follow a channel)

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required"
  },
  "payload": {},
  "status": 201,
  "response": {
    "channelId": "0a64879e-2ba5-41b7-bb18-3bcceaf1c661",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "user": {
      "username": "user",
      "firstName": "user",
      "lastName": "user",
      "avatar": null
    },
    "type": "channel"
  }
}
```

Example: /members/0a64879e-2ba5-41b7-bb18-3bcceaf1c661

- Event sent to other users

```json
{
  "type": "ADD_MEMBER",
  "payload": {
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "channelId": "0a64879e-2ba5-41b7-bb18-3bcceaf1c661",
    "user": {
      "username": "user",
      "firstName": "user",
      "lastName": "user",
      "avatar": null
    },
    "type": "channel"
  }
}
```

---

**DELETE** /members/{channelId}

**description** delete member(user un-follow a channel)

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "channelId": "0a64879e-2ba5-41b7-bb18-3bcceaf1c661",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1"
  }
}
```

Example: /members/0a64879e-2ba5-41b7-bb18-3bcceaf1c661

- Event sent to other users

```json
{
  "type": "DELETE_MEMBER",
  "payload": {
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "channelId": "0a64879e-2ba5-41b7-bb18-3bcceaf1c661"
  }
}
```

---

**POST** /members/{channelId}/admins

**description** add admin(make a member admin for a channel)

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required"
  },
  "payload": {
    "adminId": "uuid required"
  },
  "status": 201,
  "response": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "admin": true,
    "banned": false
  }
}
```

Example: /members/35b51c2e-872f-4c65-8104-02f082e6855f/admins

- Event sent to other users

```json
{
  "type": "ADD_ADMIN",
  "payload": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1"
  }
}
```

---

**DELETE** /members/{channelId}/admins/{adminId}

**description** delete admin(remove member from being admin for a channel)

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required",
    "adminId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "admin": false,
    "banned": false
  }
}
```

Example: /members/35b51c2e-872f-4c65-8104-02f082e6855f/admins/1f75f3cf-32ff-458b-b955-8e07c5aa8ff1

- Event sent to other users

```json
{
  "type": "DELETE_ADMIN",
  "payload": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1"
  }
}
```

---

**POST** /members/{channelId}/bans

**description** ban member

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required"
  },
  "payload": {
    "bannedId": "uuid required"
  },
  "status": 201,
  "response": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "admin": false,
    "banned": true
  }
}
```

Example: /members/35b51c2e-872f-4c65-8104-02f082e6855f/bans

- Event sent to other users

```json
{
  "type": "ADD_BAN",
  "payload": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1"
  }
}
```

---

**DELETE** /members/{channelId}/bans/{bannedId}

**description** remove ban(un-ban a user)

```json
{
  "auth": true,
  "query": {
    "channelId": "uuid required",
    "bannedId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1",
    "admin": false,
    "banned": false
  }
}
```

Example: /members/35b51c2e-872f-4c65-8104-02f082e6855f/bans/1f75f3cf-32ff-458b-b955-8e07c5aa8ff1

- Event sent to other users

```json
{
  "type": "DELETE_BAN",
  "payload": {
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "userId": "1f75f3cf-32ff-458b-b955-8e07c5aa8ff1"
  }
}
```
