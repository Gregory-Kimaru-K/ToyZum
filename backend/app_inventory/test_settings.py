"""Isolated model tests while the legacy app split is unfinished.

Run: python manage.py test app_products app_inventory --settings=app_inventory.test_settings
No application database or migration history is modified by this profile.
"""
from backend.settings import *

INSTALLED_APPS = [
    'django.contrib.auth', 'django.contrib.contenttypes',
    'app_accounts', 'app_products', 'app_inventory',
]
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
MIGRATION_MODULES = {name: None for name in ('auth', 'contenttypes', 'app_accounts', 'app_products', 'app_inventory')}
ROOT_URLCONF = __name__
urlpatterns = []
# These tests do not upload images. The existing Pillow dependency is unchanged.
SILENCED_SYSTEM_CHECKS = ['fields.E210']
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
