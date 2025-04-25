import os
from dotenv import load_dotenv

# Загружаем переменные окружения из файла .env
load_dotenv()

# Настройки MongoDB
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "krasnovinvest")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "")
MONGODB_CLUSTER = os.getenv("MONGODB_CLUSTER", "durak.wphttqm.mongodb.net")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "durak")
MONGODB_APPNAME = os.getenv("MONGODB_APPNAME", "DURAK")

# Настройки SSL и безопасности
SSL_ENABLED = os.getenv("SSL_ENABLED", "True").lower() == "true"
SSL_CERT_REQS = os.getenv("SSL_CERT_REQS", "CERT_REQUIRED")
CONNECT_TIMEOUT_MS = int(os.getenv("CONNECT_TIMEOUT_MS", "30000"))
RETRY_WRITES = os.getenv("RETRY_WRITES", "True").lower() == "true"
RETRY_READS = os.getenv("RETRY_READS", "True").lower() == "true"

# Настройки логирования
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO") 