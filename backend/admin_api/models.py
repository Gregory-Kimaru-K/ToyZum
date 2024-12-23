from django.db import models

# Create your models here.
class Categories(models.Model):
    name = models.TextField(max_length=100)
    image_base64 = models.TextField()