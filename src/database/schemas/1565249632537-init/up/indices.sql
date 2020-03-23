CREATE INDEX users_trgm_idx ON users USING GIST (username gist_trgm_ops);
