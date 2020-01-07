CREATE TABLE users (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  email CITEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT first_name_length CHECK(length(username) >= 1 AND length(username) <= 50),
  CONSTRAINT last_name_length CHECK(length(username) >= 1 AND length(username) <= 50),
  CONSTRAINT username_length CHECK(length(username) >= 3 AND length(username) <= 30),
  CONSTRAINT min_age CHECK(DATE(date_of_birth) <= (CURRENT_DATE - INTERVAL '13' year))
);

CREATE UNIQUE INDEX unique_username ON users (username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX unique_email ON users (email) WHERE deleted_at IS NULL;

CREATE TABLE email_verification_tokens (
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  verification_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, verification_token)
);

CREATE TABLE user_relationships (
  first_user_id UUID NOT NULL REFERENCES users(id),
  second_user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (first_user_id, second_user_id),
  CONSTRAINT unique_user_pairs CHECK(first_user_id < second_user_id),
  CONSTRAINT bounded_type CHECK(
    type = 'pending_first_second'
    OR type = 'pending_second_first'
    OR type = 'friends'
    OR type = 'block_first_second'
    OR type = 'block_second_first'
    OR type = 'block_both')
);

CREATE TABLE friends (
  first_user_id UUID NOT NULL REFERENCES users(id),
  second_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (first_user_id, second_user_id),
  CONSTRAINT not_friends_with_self CHECK(first_user_id != second_user_id),
  CONSTRAINT unique_friend_pairs CHECK(first_user_id > second_user_id)
);

CREATE TABLE friend_requests (
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE blocked_users (
  blocker_id UUID NOT NULL REFERENCES users(id),
  blocked_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE categories (
  name CITEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT name_length CHECK(length(name) >= 2 AND length(name) <= 20)
);

CREATE TABLE channels (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  private BOOLEAN NOT NULL,
  owner_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bounded_type CHECK(type = 'dm_room' OR type = 'group_room' OR type = 'channel'),
  CONSTRAINT name_length CHECK(length(name) >= 3 AND length(name) <= 20),
  CONSTRAINT description_length CHECK(description IS NULL OR (length(description) >= 1 AND length(description) <= 150)),
  CONSTRAINT channel_owner CHECK(
    CASE
      WHEN (type = 'channel') THEN
        owner_id IS NOT NULL
      ELSE
        owner_id IS NULL
    END
  ),
  CONSTRAINT private_room CHECK(
    CASE
      WHEN (type = 'dm_room' OR type = 'group_room') THEN
        private = FALSE
      ELSE
        TRUE
    END
  ),
  CONSTRAINT no_room_description CHECK(
    CASE
      WHEN (type = 'dm_room' OR type = 'group_room') THEN
        description IS NULL
      ELSE
        TRUE
    END
  )
);

CREATE TABLE channel_categories (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  category_name CITEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, category_name)
);

CREATE TABLE admins (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE members (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE banned_members (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  banned_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  banner_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, banned_id)
);

CREATE TABLE videos (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  video TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE follow_requests (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE messages (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  upload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_length CHECK(length(content) >= 1 AND length(content) <= 2000)
);

CREATE TABLE seen_messages (
  message_id UUID NOT NULL REFERENCES messages(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

CREATE TABLE posts (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_length CHECK(length(content) >= 1 AND length(content) <= 20000)
);

CREATE TABLE post_likes (
  post_id UUID NOT NULL REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE replies (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_length CHECK(length(content) >= 1 AND length(content) <= 2000)
);

CREATE TABLE reply_likes (
  reply_id UUID NOT NULL REFERENCES replies(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (reply_id, user_id)
);

CREATE TABLE notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
