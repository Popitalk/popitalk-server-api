CREATE OR REPLACE FUNCTION add_email_verification_token_trigger()
RETURNS TRIGGER AS $BODY$
BEGIN
  INSERT INTO
    email_verification_tokens
    (
      user_id
    )
  VALUES
    (NEW.id);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER add_email_verification_token
AFTER INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE add_email_verification_token_trigger();
--
--
--
