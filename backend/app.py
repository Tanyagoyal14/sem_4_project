"""Legacy compatibility wrapper.

Importing `app` from this file still works, but the real FastAPI setup now
lives in `main.py`.
"""

from main import app  # noqa: F401
