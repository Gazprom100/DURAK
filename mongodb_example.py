"""
Пример использования подключения к MongoDB
"""
import sys
from db import get_database, close_connection, with_mongodb_connection
from pymongo.errors import PyMongoError

def test_connection():
    """Тестирует подключение к MongoDB"""
    try:
        # Получаем базу данных
        db = get_database()
        print("Подключение к MongoDB успешно установлено!")
        
        # Выводим список коллекций
        collections = db.list_collection_names()
        print(f"Доступные коллекции: {collections}")
        
        # Закрываем соединение
        close_connection(db.client)
        
        return True
    except Exception as e:
        print(f"Ошибка при подключении к MongoDB: {e}")
        return False


@with_mongodb_connection
def count_documents_in_collection(collection_name, query=None, db=None):
    """
    Подсчитывает количество документов в коллекции
    
    Args:
        collection_name (str): Имя коллекции
        query (dict, optional): Запрос для фильтрации. По умолчанию None.
        db (Database): Объект базы данных (внедряется декоратором)
        
    Returns:
        int: Количество документов
    """
    if query is None:
        query = {}
    
    try:
        count = db[collection_name].count_documents(query)
        print(f"В коллекции '{collection_name}' найдено {count} документов с условием {query}")
        return count
    except PyMongoError as e:
        print(f"Ошибка при подсчете документов: {e}")
        raise


@with_mongodb_connection
def find_documents(collection_name, query=None, projection=None, limit=10, db=None):
    """
    Находит документы в коллекции
    
    Args:
        collection_name (str): Имя коллекции
        query (dict, optional): Запрос для фильтрации. По умолчанию None.
        projection (dict, optional): Проекция полей. По умолчанию None.
        limit (int, optional): Максимальное количество документов. По умолчанию 10.
        db (Database): Объект базы данных (внедряется декоратором)
        
    Returns:
        list: Список найденных документов
    """
    if query is None:
        query = {}
    
    try:
        cursor = db[collection_name].find(query, projection).limit(limit)
        documents = list(cursor)
        print(f"Найдено {len(documents)} документов в коллекции '{collection_name}'")
        return documents
    except PyMongoError as e:
        print(f"Ошибка при поиске документов: {e}")
        raise


if __name__ == "__main__":
    # Тест подключения к MongoDB
    if not test_connection():
        sys.exit(1)
    
    # Пример использования с декоратором
    try:
        # Подсчитываем документы в коллекции "users"
        count_documents_in_collection("users")
        
        # Находим документы в коллекции "transactions" с фильтром
        transactions = find_documents(
            collection_name="transactions",
            query={"status": "completed"},
            projection={"_id": 1, "amount": 1, "createdAt": 1},
            limit=5
        )
        
        # Выводим найденные транзакции
        for i, transaction in enumerate(transactions, 1):
            print(f"Транзакция {i}: {transaction}")
            
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        sys.exit(1)
        
    print("Все операции выполнены успешно!") 