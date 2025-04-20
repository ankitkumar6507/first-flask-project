import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key_here')
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '737044'
    MYSQL_DB = 'mysql_test'
