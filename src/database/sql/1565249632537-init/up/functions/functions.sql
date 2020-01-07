CREATE
OR REPLACE FUNCTION update_user_relationship(from_user UUID, to_user UUID, type TEXT)
RETURNS void AS $BODY$
DECLARE
  old_first_user_id UUID;
  old_second_user_id UUID;
  old_type TEXT;
BEGIN
  SELECT
    ur.first_user_id,
    ur.second_user_id,
    ur.type
    INTO
    old_first_user_id,
    old_second_user_id,
    old_type
  FROM
    user_relationships AS ur
  WHERE
    (ur.first_user_id = from_user AND ur.second_user_id = to_user)
    OR (ur.first_user_id = to_user AND ur.second_user_id = from_user);

  IF (type = 'friend') THEN
    IF (old_type = 'pending_first_second' AND from_user = old_second_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'friends',
        updated_at = NOW()
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'pending_second_first' AND from_user = old_first_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'friends',
        updated_at = NOW()
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type IS NULL) THEN
      INSERT INTO
        user_relationships
      VALUES(
        least(from_user, to_user),
        greatest(from_user, to_user),
        CASE
          WHEN
            from_user < to_user
          THEN
            'pending_first_second'
          ELSE
            'pending_second_first'
        END
      );
    ELSE
      RAISE NOTICE 'cant add friend';
    END IF;
  ELSIF (type = 'reject') THEN
    IF (old_type = 'pending_first_second' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'pending_second_first' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type = 'friends' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type = 'friends' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSE
      RAISE NOTICE 'cant reject friend request';
    END IF;
  ELSIF (type = 'block') THEN
    IF (old_type = 'block_first_second' AND from_user = old_second_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_both',
        updated_at = NOW()
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'block_second_first' AND from_user = old_first_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_both',
        updated_at = NOW()
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type IS NOT NULL AND from_user = old_first_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_first_second',
        updated_at = NOW()
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type IS NOT NULL AND from_user = old_second_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_second_first',
        updated_at = NOW()
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type IS NULL) THEN
      INSERT INTO
        user_relationships
      VALUES(
        least(from_user, to_user),
        greatest(from_user, to_user),
        CASE
          WHEN
            from_user < to_user
          THEN
            'block_first_second'
          ELSE
            'block_second_first'
        END
      );
    ELSE
      RAISE NOTICE 'cant block user';
    END IF;
  ELSIF (type = 'unblock') THEN
    IF (old_type = 'block_first_second' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = old_first_user_id AND second_user_id = to_user;
    ELSIF (old_type = 'block_second_first' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'block_both' AND from_user = old_second_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_first_second',
        updated_at = NOW()
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'block_both' AND from_user = old_first_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'block_second_first',
        updated_at = NOW()
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSE
      RAISE NOTICE 'cant unblock user';
    END IF;
  END IF;

END;
$BODY$ LANGUAGE plpgsql;
---
---
---
