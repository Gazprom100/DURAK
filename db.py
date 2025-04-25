import ssl
import logging
from urllib.parse import quote_plus
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Импортируем настройки из config.py
from config import (
    MONGODB_USERNAME, 
    MONGODB_PASSWORD, 
    MONGODB_CLUSTER,
    MONGODB_DATABASE,
    MONGODB_APPNAME,
    SSL_ENABLED,
    SSL_CERT_REQS,
    CONNECT_TIMEOUT_MS,
    RETRY_WRITES,
    RETRY_READS,
    LOG_LEVEL
)

# Настраиваем логирование
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('mongodb_connection')

def get_connection_string():
    """Создает и возвращает строку подключения к MongoDB"""
    if not MONGODB_PASSWORD:
        logger.error("Пароль MongoDB не указан в переменных окружения")
        raise ValueError("Пароль MongoDB отсутствует. Проверьте ваш файл .env")
    
    # Кодируем пароль для обработки специальных символов
    encoded_password = quote_plus(MONGODB_PASSWORD)
    
    # Формируем URI для подключения
    uri = f"mongodb+srv://{MONGODB_USERNAME}:{encoded_password}@{MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName={MONGODB_APPNAME}"
    
    return uri

def get_client_options():
    """Настраивает и возвращает параметры подключения к MongoDB"""
    options = {
        "server_api": ServerApi('1'),
        "connectTimeoutMS": CONNECT_TIMEOUT_MS,
        "retryWrites": RETRY_WRITES,
        "retryReads": RETRY_READS
    }
    
    # Добавляем SSL параметры, если SSL включен
    if SSL_ENABLED:
        ssl_cert_option = getattr(ssl, SSL_CERT_REQS)
        options.update({
            "ssl": True,
            "ssl_cert_reqs": ssl_cert_option
        })
    
    return options

def get_database():
    """Создает подключение к MongoDB и возвращает объект базы данных"""
    try:
        # Получаем строку подключения и параметры
        connection_string = get_connection_string()
        client_options = get_client_options()
        
        # Создаем клиент MongoDB
        client = MongoClient(connection_string, **client_options)
        
        # Проверяем подключение
        client.admin.command('ping')
        logger.info("Подключение к MongoDB успешно установлено")
        
        # Возвращаем объект базы данных
        return client[MONGODB_DATABASE]
    
    except ConnectionFailure as e:
        logger.error(f"Не удалось подключиться к MongoDB: {e}")
        raise
    except ServerSelectionTimeoutError as e:
        logger.error(f"Превышено время ожидания подключения к серверу MongoDB: {e}")
        raise
    except Exception as e:
        logger.error(f"Неизвестная ошибка при подключении к MongoDB: {e}")
        raise

def close_connection(client):
    """Закрывает соединение с MongoDB"""
    if client:
        client.close()
        logger.info("Соединение с MongoDB закрыто")

# Создаем функцию-декоратор для автоматического управления соединениями
def with_mongodb_connection(func):
    """Декоратор для автоматического управления соединениями с MongoDB"""
    def wrapper(*args, **kwargs):
        client = None
        db = None
        try:
            # Получаем подключение к базе данных
            client = MongoClient(get_connection_string(), **get_client_options())
            db = client[MONGODB_DATABASE]
            
            # Передаем базу данных в функцию
            result = func(db=db, *args, **kwargs)
            return result
        
        except Exception as e:
            logger.error(f"Ошибка при выполнении операции с MongoDB: {e}")
            raise
        
        finally:
            # Всегда закрываем соединение
            if client:
                client.close()
    
    return wrapper 