**POST** /channels

**description** create new channel

```json
{
  "auth": true,
  "payload": {
    "name": "string min(3) max(20) required",
    "description": "string min(1) max(150) required",
    "icon": "optional file",
    "public": "boolean required"
  },
  "status": 201,
  "response": {
    "channelId": "d03b7c60-228e-4f9c-8e45-4afada99e6d9",
    "channel": {
      "id": "d03b7c60-228e-4f9c-8e45-4afada99e6d9",
      "type": "channel",
      "name": "test",
      "description": "test",
      "icon": null,
      "public": true,
      "ownerId": "42e5b625-83d1-4b26-aeba-cfca8a35e066",
      "createdAt": "2020-12-14T15:07:48.368984+00:00",
      "firstMessageId": null,
      "lastMessageId": null,
      "lastMessageAt": null,
      "firstPostId": null,
      "lastPostId": null,
      "lastPostAt": null,
      "status": "Ended",
      "queueStartPosition": 0,
      "videoStartTime": 0,
      "clockStartTime": "2020-12-14T15:07:48.368984+00:00",
      "members": ["42e5b625-83d1-4b26-aeba-cfca8a35e066"],
      "admins": ["42e5b625-83d1-4b26-aeba-cfca8a35e066"],
      "banned": [],
      "messages": [],
      "posts": [],
      "queue": []
    },
    "users": {
      "42e5b625-83d1-4b26-aeba-cfca8a35e066": {
        "id": "42e5b625-83d1-4b26-aeba-cfca8a35e066",
        "firstName": "Ahmed",
        "lastName": "Safi",
        "username": "Ahmed97",
        "avatar": null
      }
    },
    "messages": null,
    "posts": null,
    "comments": null
  }
}
```

---

**GET** /channels/channel

**description** gets info of a channel

```json
{
  "auth": false,
  "query": {
    "channelId": "uuid required",
    "leave": "uuid optional"
  },
  "payload": {},
  "status": 200,
  "response": {
    "channelId": "1dad0715-04a7-4dc5-95a5-eadc2e1ad5ce",
    "channel": {
      "id": "1dad0715-04a7-4dc5-95a5-eadc2e1ad5ce",
      "type": "channel",
      "name": "test",
      "description": "dasddas",
      "icon": null,
      "public": true,
      "ownerId": "94971ff2-567f-4133-9582-f96d297f0064",
      "createdAt": "2020-12-14T17:31:23.200725+02:00",
      "firstMessageId": null,
      "lastMessageId": null,
      "lastMessageAt": null,
      "firstPostId": null,
      "lastPostId": null,
      "lastPostAt": null,
      "status": "Ended",
      "queueStartPosition": 0,
      "videoStartTime": 0,
      "clockStartTime": "2020-12-14T17:31:23.200725+02:00",
      "members": ["94971ff2-567f-4133-9582-f96d297f0064"],
      "admins": ["94971ff2-567f-4133-9582-f96d297f0064"],
      "banned": [],
      "messages": [],
      "posts": [],
      "queue": [],
      "viewers": []
    },
    "users": {
      "94971ff2-567f-4133-9582-f96d297f0064": {
        "id": "94971ff2-567f-4133-9582-f96d297f0064",
        "firstName": "tester",
        "lastName": "tester",
        "username": "tester",
        "avatar": null
      }
    },
    "messages": null,
    "posts": null,
    "comments": null,
    "type": "channel",
    "isPublic": true,
    "isOwner": true,
    "isAdmin": true,
    "isMember": true,
    "isBanned": false
  }
}
```

- if leave is not provided then this event is sent to other users in the channel

```json
{
  "type": "ADD_VIEWER",
  "payload": {
    "userId": "94971ff2-567f-4133-9582-f96d297f0064",
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "user": {
      "username": "tester",
      "firstName": "tester",
      "lastName": "tester",
      "avatar": null
    },
    "type": "channel"
  }
}
```

- if leave is provided then this event is sent to other users in the channel

```json
{
  "type": "DELETE_VIEWER",
  "payload": {
    "userId": "94971ff2-567f-4133-9582-f96d297f0064",
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "type": "channel"
  }
}
```

---

**POST** /channels/visitAndLeave

**description** add user as viewer when joining a channel and remove the user when leave the channel

```json
{
  "auth": true,
  "payload": {
    "visit": "uuid optional",
    "leave": "uuid optional"
  },
  "status": 204,
  "response": {}
}
```

- if `visit` then this event is sent to other users

```json
{
  "type": "ADD_VIEWER",
  "payload": {
    "userId": "94971ff2-567f-4133-9582-f96d297f0064",
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "user": {
      "username": "tester",
      "firstName": "tester",
      "lastName": "tester",
      "avatar": null
    },
    "type": "channel"
  }
}
```

- if `leave` then this event is sent to other users

```json
{
  "type": "DELETE_VIEWER",
  "payload": {
    "userId": "94971ff2-567f-4133-9582-f96d297f0064",
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "type": "channel"
  }
}
```

---

**PUT** /channels/{channelId}

**description** updates the channel

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "payload": "the same of POST /channels(provide the keys to be changed)",
  "status": 200,
  "response": {
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "updatedChannel": {
      "id": "507314ac-d588-40ee-86d6-8f006206512f",
      "type": "channel",
      "name": "test",
      "description": "hmbm",
      "icon": null,
      "public": true,
      "ownerId": "94971ff2-567f-4133-9582-f96d297f0064",
      "createdAt": "2020-12-14T15:27:32.839Z"
    }
  }
}
```

- event sent to other users

```json
{
  "type": "UPDATE_CHANNEL",
  "payload": {
    "channelId": "507314ac-d588-40ee-86d6-8f006206512f",
    "updatedChannel": {
      "id": "507314ac-d588-40ee-86d6-8f006206512f",
      "type": "channel",
      "name": "test",
      "description": "hmbm",
      "icon": null,
      "public": true,
      "ownerId": "94971ff2-567f-4133-9582-f96d297f0064",
      "createdAt": "2020-12-14T15:27:32.839Z"
    }
  }
}
```

---

**DELETE** /channels/{channelId}

**description** delete a channel

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "status": 200,
  "response": {
    "channelId": "uuid"
  }
}
```

- event sent to other users

```json
{
  "type": "DELETE_CHANNEL",
  "payload": { "channelId": "507314ac-d588-40ee-86d6-8f006206512f" }
}
```

---

**PUT** /channels/{channelId}/play

**description** sets playing status

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "payload": {
    "queueStartPosition": "integer",
    "clockStartTime": "timestamp",
    "videoStartTime": "number"
  },
  "status": 200,
  "response": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "updatedChannel": {
      "queueStartPosition": 0,
      "videoStartTime": 249.033821,
      "clockStartTime": "2020-12-14T16:35:41.000Z",
      "status": "Playing"
    }
  }
}
```

- event sent to other users

```json
{
  "type": "UPDATE_CHANNEL",
  "payload": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "updatedChannel": {
      "queueStartPosition": 0,
      "videoStartTime": 249.033821,
      "clockStartTime": "2020-12-14T16:35:41.000Z",
      "status": "Playing"
    }
  }
}
```

---

**PUT** /channels/{channelId}/pause

**description** sets paused status

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "payload": {
    "queueStartPosition": "integer",
    "clockStartTime": "timestamp",
    "videoStartTime": "number"
  },
  "status": 200,
  "response": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "updatedChannel": {
      "queueStartPosition": 0,
      "videoStartTime": 386.26656199046323,
      "clockStartTime": "2020-12-14T16:37:58.000Z",
      "status": "Paused"
    }
  }
}
```

- event sent to other users

```json
{
  "type": "UPDATE_CHANNEL",
  "payload": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "updatedChannel": {
      "queueStartPosition": 0,
      "videoStartTime": 386.26656199046323,
      "clockStartTime": "2020-12-14T16:37:58.000Z",
      "status": "Paused"
    }
  }
}
```

---

**GET** /channels/discover

**description** discover channels

```json
{
  "auth": false,
  "status": 200,
  "response": {
    "channels": {
      "bdf22ad1-1e87-4fe3-8b48-4cec60462cba": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      },
      "1dad0715-04a7-4dc5-95a5-eadc2e1ad5ce": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      },
      "23c174a9-4a16-4b9d-9804-04bcbb20379a": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Playing",
        "videoInfo": {
          "title": "The Lie Detector With Noah Beck | The Dixie D'Amelio Show",
          "publishedAt": "2020-12-13T18:00:11Z",
          "thumbnail": "https://i.ytimg.com/vi/ttmC2XvKALA/hqdefault.jpg",
          "url": "https://www.youtube.com/watch?v=ttmC2XvKALA"
        },
        "viewers": ["1a585f55-6985-4cf4-a166-12d4ee075cb5"]
      }
    },
    "users": {
      "1a585f55-6985-4cf4-a166-12d4ee075cb5": {
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "Ahmed97",
        "avatar": null
      }
    }
  }
}
```

NOTE: limit is 30 channels

---

**GET** /channels/trending

**description** trending channels

```json
{
  "auth": false,
  "status": 200,
  "response": {
    "channels": {
      "1dad0715-04a7-4dc5-95a5-eadc2e1ad5ce": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      },
      "23c174a9-4a16-4b9d-9804-04bcbb20379a": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Playing",
        "videoInfo": {
          "title": "The Lie Detector With Noah Beck | The Dixie D'Amelio Show",
          "publishedAt": "2020-12-13T18:00:11Z",
          "thumbnail": "https://i.ytimg.com/vi/ttmC2XvKALA/hqdefault.jpg",
          "url": "https://www.youtube.com/watch?v=ttmC2XvKALA"
        },
        "viewers": ["1a585f55-6985-4cf4-a166-12d4ee075cb5"]
      },
      "bdf22ad1-1e87-4fe3-8b48-4cec60462cba": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      }
    },
    "users": {
      "1a585f55-6985-4cf4-a166-12d4ee075cb5": {
        "firstName": "ahmed",
        "lastName": "safi",
        "username": "Ahmed97",
        "avatar": null
      }
    }
  }
}
```

NOTE: limit is 30 channels

---

**GET** /channels/following

**description** following channels

```json
{
  "auth": true,
  "status": 200,
  "response": {
    "channels": {
      "23c174a9-4a16-4b9d-9804-04bcbb20379a": {
        "name": "test",
        "icon": null,
        "playbackStatus": "Playing",
        "videoInfo": {
          "title": "The Lie Detector With Noah Beck | The Dixie D'Amelio Show",
          "publishedAt": "2020-12-13T18:00:11Z",
          "thumbnail": "https://i.ytimg.com/vi/ttmC2XvKALA/hqdefault.jpg",
          "url": "https://www.youtube.com/watch?v=ttmC2XvKALA"
        },
        "viewers": []
      }
    },
    "users": {}
  }
}
```

---

**GET** /channels/search

**description** search for a channel

```json
{
  "auth": false,
  "query": {
    "channelName": "min(2) max(50) required",
    "page": "integer min(1) default(1) optional"
  },
  "status": 200,
  "response": {
    "channelName": "test",
    "page": 1,
    "channels": {
      "bdf22ad1-1e87-4fe3-8b48-4cec60462cba": {
        "name": "test",
        "icon": null,
        "description": "test",
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      },
      "1dad0715-04a7-4dc5-95a5-eadc2e1ad5ce": {
        "name": "test",
        "icon": null,
        "description": "dasddas",
        "playbackStatus": "Ended",
        "videoInfo": null,
        "viewers": []
      },
      "23c174a9-4a16-4b9d-9804-04bcbb20379a": {
        "name": "test",
        "icon": null,
        "description": "test",
        "playbackStatus": "Playing",
        "videoInfo": null,
        "viewers": []
      }
    },
    "users": {}
  }
}
```
