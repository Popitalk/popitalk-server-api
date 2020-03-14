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
    type = 'friend_first_second'
    OR type = 'friend_second_first'
    OR type = 'friend_both'
    OR type = 'block_first_second'
    OR type = 'block_second_first'
    OR type = 'block_both')
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
  name TEXT,
  description TEXT,
  icon TEXT,
  public BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bounded_type CHECK(type = 'self' OR type = 'friend' OR type = 'group' OR type = 'channel'),
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
      WHEN (type != 'channel') THEN
        public = FALSE
      ELSE
        TRUE
    END
  ),
  CONSTRAINT no_nameless_channel CHECK(
    CASE
      WHEN (type = 'channel') THEN
        name IS NOT NULL
      ELSE
        TRUE
    END
  ),
  CONSTRAINT no_room_description CHECK(
    CASE
      WHEN (type != 'channel') THEN
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

CREATE TABLE members (
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  admin BOOLEAN NOT NULL DEFAULT FALSE,
  banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id),
  CONSTRAINT no_banned_admins CHECK(
    CASE
      WHEN
        admin = TRUE
      THEN
        banned = FALSE
      ELSE
        TRUE
    END
  )
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
  user_id UUID NOT NULL REFERENCES users(id),
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
  upload TEXT,
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

CREATE TABLE comments (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_length CHECK(length(content) >= 1 AND length(content) <= 2000)
);

CREATE TABLE comment_likes (
  comment_id UUID NOT NULL REFERENCES comments(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE notifications (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE TABLE abc_id (
--   id TEXT NOT NULL DEFAULT hashid() PRIMARY KEY,
--   name text
-- );
