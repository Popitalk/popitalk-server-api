**POST** /posts

**description** create a post in a channel

```json
{
  "auth": true,
  "payload": {
    "channelId": "uuid required",
    "content": "string required"
  },
  "status": 201,
  "response": {
    "post": {
      "id": "62df0a57-32fd-46a3-8709-8e90683ef61d",
      "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
      "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
      "content": "post content",
      "upload": null,
      "createdAt": "2021-01-16T20:01:22.002988+02:00",
      "author": {
        "id": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
        "username": "Lea71",
        "avatar": null
      },
      "liked": false,
      "likeCount": 0,
      "commentCount": 0,
      "selfCommentCount": 0,
      "firstCommentId": null,
      "lastCommentId": null,
      "comments": []
    },
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```

- Event sent to other users

```json
{
  "type": "ADD_POST",
  "payload": {
    "post": {
      "id": "62df0a57-32fd-46a3-8709-8e90683ef61d",
      "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
      "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
      "content": "post content",
      "upload": null,
      "createdAt": "2021-01-16T20:01:22.002988+02:00",
      "author": {
        "id": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
        "username": "Lea71",
        "avatar": null
      },
      "liked": false,
      "likeCount": 0,
      "commentCount": 0,
      "selfCommentCount": 0,
      "firstCommentId": null,
      "lastCommentId": null,
      "comments": []
    },
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```

---

**DELETE** /posts/{postId}

**description** delete a channel's post

```json
{
  "auth": true,
  "query": {
    "postId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "postId": "62df0a57-32fd-46a3-8709-8e90683ef61d",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "firstPostId": null,
    "lastPostId": null,
    "lastPostAt": null
  }
}
```

Example: /posts/62df0a57-32fd-46a3-8709-8e90683ef61d

- Event sent to other users

```json
{
  "type": "DELETE_POST",
  "payload": {
    "postId": "62df0a57-32fd-46a3-8709-8e90683ef61d",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f",
    "firstPostId": null,
    "lastPostId": null,
    "lastPostAt": null
  }
}
```

---

**POST** /posts/{postId}/likes

**description** Adds post like

```json
{
  "auth": true,
  "payload": {
    "postId": "uuid required"
  },
  "status": 201,
  "response": {
    "postId": "b94c9873-8db6-446c-8c5f-4e9691e58a95",
    "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```

Example: /posts/b94c9873-8db6-446c-8c5f-4e9691e58a95/likes

- Event sent to other users

```json
{
  "type": "ADD_POST_LIKE",
  "payload": {
    "postId": "b94c9873-8db6-446c-8c5f-4e9691e58a95",
    "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```

---

**DELETE** /posts/{postId}/likes

**description** removes a post's like

```json
{
  "auth": true,
  "query": {
    "postId": "uuid required"
  },
  "payload": {},
  "status": 200,
  "response": {
    "postId": "b94c9873-8db6-446c-8c5f-4e9691e58a95",
    "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```

Example: /posts/b94c9873-8db6-446c-8c5f-4e9691e58a95/likes

- Event sent to other users

```json
{
  "type": "DELETE_POST_LIKE",
  "payload": {
    "postId": "b94c9873-8db6-446c-8c5f-4e9691e58a95",
    "userId": "5fc4b21c-062f-4cd8-88a4-d9e5b503b98a",
    "channelId": "35b51c2e-872f-4c65-8104-02f082e6855f"
  }
}
```
