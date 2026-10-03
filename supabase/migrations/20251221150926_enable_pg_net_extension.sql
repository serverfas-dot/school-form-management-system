/*
  # Enable pg_net Extension

  1. Purpose
    - Enable pg_net extension for making HTTP requests from database triggers
    - Required for automatic approval email notifications

  2. Changes
    - Enable pg_net extension
    - Allows database functions to make HTTP requests to edge functions
*/

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
