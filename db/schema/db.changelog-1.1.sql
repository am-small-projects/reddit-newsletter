--liquibase formatted sql

--changeset afshan-aman:1.1-table-ddl

-- user can be created in two ways:
-- when they want to subscribe to a newsletter, in which case, email is a must
-- without subscribing to any newsletter, in which case email is optional
    -- because they can always edit their preferences later!
CREATE TABLE IF NOT EXISTS reddit_newsletter.user (
    id uuid NOT NULL DEFAULT public.uuid_generate_v4(),
    first_name text NULL,
    last_name text NULL,
    email text UNIQUE NULL,
    timezone text NOT NULL,
    subscribed boolean NULL DEFAULT false,
    schedule_id text NULL,

    PRIMARY KEY (id)
);

-- all channels favorited by all users are stored here, one unique row per channel
CREATE TABLE IF NOT EXISTS reddit_newsletter.reddit_channel (
    id uuid NOT NULL DEFAULT public.uuid_generate_v4(),
    channel_type text NOT NULL,
    channel_url text NOT NULL,

    PRIMARY KEY (id)
);

-- user's favorite channels are stored here
CREATE TABLE IF NOT EXISTS reddit_newsletter.reddit_favorites (
    id uuid NOT NULL DEFAULT public.uuid_generate_v4(),
    user_id uuid NOT NULL,
    channel_id uuid NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES reddit_newsletter.user (id),
    FOREIGN KEY (channel_id) REFERENCES reddit_newsletter.reddit_channel (id)
);


