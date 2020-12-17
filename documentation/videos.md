**GET** /videos/search

**description** Search for videos

```json
{
  "auth": true,
  "query": {
    "source": "video source (required)(we are using 'youtube' at the meantime)",
    "terms": "something to search for required",
    "page": "nextPageToken provided within the response to search for more results (optional)"
  },
  "status": 201
}
```

Example:

- `/videos/search?source=youtube&terms=amv`

- response:

```json
{
  "nextPageToken": "CBkQAA",
  "totalResults": 1000000,
  "results": [
    {
      "id": "BbzalAgbahc",
      "url": "https://www.youtube.com/watch?v=BbzalAgbahc",
      "publishedAt": "2020-08-15T14:43:59Z",
      "title": "Warriors - AMV - 「Anime MV」",
      "thumbnail": "https://i.ytimg.com/vi/BbzalAgbahc/hqdefault.jpg"
    },
    "..."
  ]
}
```

---

**GET** /videos/queue/{channelId}

**description** gets the channel queue

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "status": 201,
  "response": {
    "queue": {
      "queue": [
        {
          "id": "e62a8e5f-1b14-475c-aeee-efdbab4d2a99",
          "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
          "videoId": "youtube ttmC2XvKALA",
          "length": 822,
          "videoInfo": {
            "title": "The Lie Detector With Noah Beck | The Dixie D'Amelio Show",
            "publishedAt": "2020-12-13T18:00:11Z",
            "thumbnail": "https://i.ytimg.com/vi/ttmC2XvKALA/hqdefault.jpg",
            "url": "https://www.youtube.com/watch?v=ttmC2XvKALA"
          },
          "title": "The Lie Detector With Noah Beck | The Dixie D'Amelio Show",
          "publishedAt": "2020-12-13T18:00:11Z",
          "thumbnail": "https://i.ytimg.com/vi/ttmC2XvKALA/hqdefault.jpg",
          "url": "https://www.youtube.com/watch?v=ttmC2XvKALA"
        },
        "..."
      ]
    }
  }
}
```

---

**POST** /videos/{channelId}

**description** Adds a video to a channel queue

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "payload": {
    "source": "video source (required)(we are using 'youtube' at the meantime)",
    "sourceId": "the id of the video(for example 'LeYsRMZFUq0' using youtube)",
    "length": "number indicates the length of the video (optional)",
    "videoInfo": "additional info about the video (you get this object when search about videos)(required)"
  },
  "status": 201,
  "response": "illustrated in the example"
}
```

Example:

- request endpoint `/videos/23c174a9-4a16-4b9d-9804-04bcbb20379a`
- request payload

```json
{
  "source": "youtube",
  "sourceId": "9X_nbT89X-c",
  "videoInfo": {
    "title": "Pocket Flame Thrower | OT 21",
    "publishedAt": "2020-12-14T23:00:03Z",
    "thumbnail": "https://i.ytimg.com/vi/9X_nbT89X-c/hqdefault.jpg",
    "url": "https://www.youtube.com/watch?v=9X_nbT89X-c"
  }
}
```

- response payload

```json
{
  "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
  "video": {
    "id": "1d98a987-48b2-4960-9fb7-b51408b35b3d",
    "videoId": "youtube 9X_nbT89X-c",
    "queuePosition": 4,
    "title": "Pocket Flame Thrower | OT 21",
    "publishedAt": "2020-12-14T23:00:03Z",
    "thumbnail": "https://i.ytimg.com/vi/9X_nbT89X-c/hqdefault.jpg",
    "url": "https://www.youtube.com/watch?v=9X_nbT89X-c",
    "length": 1579
  },
  "updatedChannel": {
    "queueStartPosition": 1,
    "videoStartTime": 41.27000000000555,
    "clockStartTime": "2020-12-17T16:35:46.000Z",
    "status": "Playing"
  }
}
```

- Event sent to other users

```json
{
  "type": "ADD_VIDEO",
  "payload": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "video": {
      "id": "1d98a987-48b2-4960-9fb7-b51408b35b3d",
      "videoId": "youtube 9X_nbT89X-c",
      "queuePosition": 4,
      "title": "Pocket Flame Thrower | OT 21",
      "publishedAt": "2020-12-14T23:00:03Z",
      "thumbnail": "https://i.ytimg.com/vi/9X_nbT89X-c/hqdefault.jpg",
      "url": "https://www.youtube.com/watch?v=9X_nbT89X-c",
      "length": 1579
    },
    "updatedChannel": {
      "queueStartPosition": 1,
      "videoStartTime": 41.27000000000555,
      "clockStartTime": "2020-12-17T16:35:46.000Z",
      "status": "Playing"
    }
  }
}
```

---

**PUT** /videos/{channelId}

**description** Updates video order in a channel queue

```json
{
  "auth": true,
  "params": {
    "channelId": "uuid required"
  },
  "payload": {
    "oldIndex": "the old index of the video in the array (number required)",
    "newIndex": "the new index of the video in the array (number required)"
  },
  "status": 200,
  "response": "illustrated in the example"
}
```

- request endpoint `/videos/23c174a9-4a16-4b9d-9804-04bcbb20379a`
- request payload

```json
{ "oldIndex": 1, "newIndex": 3 }
```

- response payload

```json
{
  "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
  "oldIndex": 1,
  "newIndex": 3,
  "updatedChannel": {
    "queueStartPosition": 3,
    "videoStartTime": 347.82100000000554,
    "clockStartTime": "2020-12-17T16:40:52.000Z",
    "status": "Playing"
  }
}
```

- Event sent to other users

```json
{
  "type": "REORDER_QUEUE",
  "payload": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "oldIndex": 1,
    "newIndex": 3,
    "updatedChannel": {
      "queueStartPosition": 3,
      "videoStartTime": 347.82100000000554,
      "clockStartTime": "2020-12-17T16:40:52.000Z",
      "status": "Playing"
    }
  }
}
```

---

**DELETE** /videos/{channelVideoId}

**description** Deletes a video from a channel queue

```json
{
  "auth": true,
  "params": {
    "channelVideoId": "uuid required"
  },
  "payload": {
    "channelId": "uuid required"
  },
  "status": 200,
  "response": "illustrated in the example"
}
```

- request endpoint `/videos/e62a8e5f-1b14-475c-aeee-efdbab4d2a99`
- request payload

```json
{ "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a" }
```

- response payload

```json
{
  "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
  "queuePosition": 0,
  "updatedChannel": {
    "queueStartPosition": 3,
    "videoStartTime": 130.7870000000055,
    "clockStartTime": "2020-12-17T16:51:35.000Z",
    "status": "Playing"
  }
}
```

- Event sent to other users

```json
{
  "type": "DELETE_VIDEO",
  "payload": {
    "channelId": "23c174a9-4a16-4b9d-9804-04bcbb20379a",
    "queuePosition": 0,
    "updatedChannel": {
      "queueStartPosition": 3,
      "videoStartTime": 130.7870000000055,
      "clockStartTime": "2020-12-17T16:51:35.000Z",
      "status": "Playing"
    }
  }
}
```
