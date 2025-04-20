import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key_here')  
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')  
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')  
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'password_here')  
    MYSQL_DB = os.getenv('MYSQL_DB', 'mysql_test')  

