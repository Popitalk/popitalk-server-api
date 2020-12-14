**POST** /messages

**description** add new message

Example:

```json
{
  "auth": true,
  "payload": {
    "channelId": "542efe8c-6442-4771-9a1a-90b791e6ff0d",
    "content": "wad",
    "upload": null
  },
  "status": 201,
  "response": {
    "message": {
      "id": "7c66e161-0ca4-4ef9-bf6b-104e4872017e",
      "channelId": "542efe8c-6442-4771-9a1a-90b791e6ff0d",
      "userId": "94971ff2-567f-4133-9582-f96d297f0064",
      "content": "wad",
      "upload": null,
      "createdAt": "2020-12-12T19:17:35.38486+02:00",
      "author": {
        "id": "94971ff2-567f-4133-9582-f96d297f0064",
        "username": "tester",
        "avatar": null
      }
    },
    "channelId": "542efe8c-6442-4771-9a1a-90b791e6ff0d",
    "userId": "94971ff2-567f-4133-9582-f96d297f0064"
  }
}
```

- Event sent to other users(receivers)

```json
{
  "type": "ADD_MESSAGE",
  "payload": {
    "message": {
      "id": "9996aab0-e597-425a-8747-4005ea04e29e",
      "channelId": "542efe8c-6442-4771-9a1a-90b791e6ff0d",
      "userId": "94971ff2-567f-4133-9582-f96d297f0064",
      "content": "a",
      "upload": null,
      "createdAt": "2020-12-12T19:16:24.941816+02:00",
      "author": {
        "id": "94971ff2-567f-4133-9582-f96d297f0064",
        "username": "tester",
        "avatar": null
      }
    },
    "channelId": "542efe8c-6442-4771-9a1a-90b791e6ff0d",
    "userId": "94971ff2-567f-4133-9582-f96d297f0064"
  }
}
```

---

**GET** /messages/{channelId}

**description** get channels messages(limit 50)

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "query": {
    "afterMessageId": "uuid optional",
    "beforeMessageId": "uuid optional"
  },
  "status": 200,
  "response": "illustrated in the example"
}
```

Response Example:

```json
{
  "channelId": "84c0bded-e4ff-49c2-b40d-880759cb5ba0",
  "channel": {
    "id": "84c0bded-e4ff-49c2-b40d-880759cb5ba0",
    "type": "friend",
    "name": null,
    "public": false,
    "createdAt": "2020-12-12T19:51:15.632739+02:00",
    "firstMessageId": "9c4a7333-a3e7-41f0-a011-8183565fc1bb",
    "lastMessageId": "9c4a7333-a3e7-41f0-a011-8183565fc1bb",
    "lastMessageAt": "2020-12-12T19:51:35.777543+02:00",
    "status": "Ended",
    "queueStartPosition": 0,
    "videoStartTime": 0,
    "clockStartTime": "2020-12-12T19:51:15.632739+02:00",
    "members": [
      "94971ff2-567f-4133-9582-f96d297f0064",
      "1a585f55-6985-4cf4-a166-12d4ee075cb5"
    ],
    "messages": ["9c4a7333-a3e7-41f0-a011-8183565fc1bb"],
    "queue": [],
    "viewers": ["1a585f55-6985-4cf4-a166-12d4ee075cb5"]
  },
  "users": {
    "94971ff2-567f-4133-9582-f96d297f0064": {
      "id": "94971ff2-567f-4133-9582-f96d297f0064",
      "firstName": "tester",
      "lastName": "tester",
      "username": "tester",
      "avatar": null
    },
    "1a585f55-6985-4cf4-a166-12d4ee075cb5": {
      "firstName": "ahmed",
      "lastName": "safi",
      "username": "Ahmed97",
      "avatar": null
    }
  },
  "messages": {
    "9c4a7333-a3e7-41f0-a011-8183565fc1bb": {
      "id": "9c4a7333-a3e7-41f0-a011-8183565fc1bb",
      "userId": "94971ff2-567f-4133-9582-f96d297f0064",
      "channelId": "84c0bded-e4ff-49c2-b40d-880759cb5ba0",
      "content": "a",
      "upload": null,
      "createdAt": "2020-12-12T19:51:35.777543+02:00",
      "author": {
        "id": "94971ff2-567f-4133-9582-f96d297f0064",
        "username": "tester",
        "avatar": null
      }
    }
  },
  "type": "friend",
  "isPublic": false,
  "isOwner": null,
  "isAdmin": false,
  "isMember": true,
  "isBanned": false
}
```

---

**DELETE** /messages/{messageId}

**description:** "deletes a message

```json
{
  "auth": true,
  "params": {
    "messageId": "uuid required"
  },
  "status": 200,
  "response": "illustrated in the example"
}
```

Response Example:

```json
{
  "messageId": "ab68dc95-50cf-4fc7-a5a8-31f18a852eab",
  "channelId": "84c0bded-e4ff-49c2-b40d-880759cb5ba0",
  "firstMessageId": "e4fceebc-420b-454b-840d-c83732640d4e",
  "lastMessageId": "88ee7faf-3921-45ef-b01d-9e3ff235d91c",
  "lastMessageAt": "2020-12-12T18:12:38.428Z"
}
```

Event sent to other users:

```json
{
  "type": "DELETE_MESSAGE",
  "payload": {
    "messageId": "ab68dc95-50cf-4fc7-a5a8-31f18a852eab",
    "channelId": "84c0bded-e4ff-49c2-b40d-880759cb5ba0",
    "firstMessageId": "e4fceebc-420b-454b-840d-c83732640d4e",
    "lastMessageId": "88ee7faf-3921-45ef-b01d-9e3ff235d91c",
    "lastMessageAt": "2020-12-12T18:12:38.428Z"
  }
}
```
