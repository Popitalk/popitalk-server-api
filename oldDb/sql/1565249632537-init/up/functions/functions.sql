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
    IF (old_type = 'friend_first_second' AND from_user = old_second_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'friend_both',
        updated_at = NOW()
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'friend_second_first' AND from_user = old_first_user_id) THEN
      UPDATE
        user_relationships
      SET
        type = 'friend_both',
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
            'friend_first_second'
          ELSE
            'friend_second_first'
        END
      );
    ELSE
      RAISE NOTICE 'cant friend';
    END IF;
  ELSIF (type = 'unfriend') THEN
    IF (old_type = 'friend_first_second' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type = 'friend_first_second' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'friend_second_first' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type = 'friend_second_first' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSIF (old_type = 'friend_both' AND from_user = old_first_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = from_user AND second_user_id = to_user;
    ELSIF (old_type = 'friend_both' AND from_user = old_second_user_id) THEN
      DELETE FROM
        user_relationships
      WHERE
        first_user_id = to_user AND second_user_id = from_user;
    ELSE
      RAISE NOTICE 'cant unfriend';
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
      RAISE NOTICE 'cant block';
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
      RAISE NOTICE 'cant unblock';
    END IF;
  END IF;

END;
$BODY$ LANGUAGE plpgsql;
---
---
---
DROP FUNCTION IF EXISTS anyarray_uniq(anyarray);
CREATE OR REPLACE FUNCTION anyarray_uniq(with_array anyarray)
	RETURNS anyarray AS
$BODY$
	DECLARE
		-- The variable used to track iteration over "with_array".
		loop_offset integer;

		-- The array to be returned by this function.
		return_array with_array%TYPE := '{}';
	BEGIN
		IF with_array IS NULL THEN
			return NULL;
		END IF;

		IF with_array = '{}' THEN
		    return return_array;
		END IF;

		-- Iterate over each element in "concat_array".
		FOR loop_offset IN ARRAY_LOWER(with_array, 1)..ARRAY_UPPER(with_array, 1) LOOP
			IF with_array[loop_offset] IS NULL THEN
				IF NOT EXISTS(
					SELECT 1
					FROM UNNEST(return_array) AS s(a)
					WHERE a IS NULL
				) THEN
					return_array = ARRAY_APPEND(return_array, with_array[loop_offset]);
				END IF;
			-- When an array contains a NULL value, ANY() returns NULL instead of FALSE...
			ELSEIF NOT(with_array[loop_offset] = ANY(return_array)) OR NOT(NULL IS DISTINCT FROM (with_array[loop_offset] = ANY(return_array))) THEN
				return_array = ARRAY_APPEND(return_array, with_array[loop_offset]);
			END IF;
		END LOOP;

	RETURN return_array;
 END;
$BODY$ LANGUAGE plpgsql;
---
---
---
CREATE OR REPLACE FUNCTION hashid(OUT result TEXT) AS $BODY$
BEGIN
  result := id_encode(nextval('id_seq'), 'playnows', 10);
END;
$BODY$ LANGUAGE plpgsql;
