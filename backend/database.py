"""Legacy compatibility wrapper.

The real MongoDB setup now lives in `db.py`.
"""

from db import db, feedback_collection, profile_collection, profiles_collection, users_collection  # noqa: F401
