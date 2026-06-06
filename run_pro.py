import os

from app.server import run


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8784"))
    run(host=host, port=port)
