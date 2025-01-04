from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Categories(models.Model):
    name = models.TextField(max_length=100)
    image_base64 = models.TextField()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=16, null=True, unique=True, blank=True)

    def __str__(self):
        return self.user.username