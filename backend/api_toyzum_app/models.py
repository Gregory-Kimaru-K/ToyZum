from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, phone_number, first_name, last_name, password=None, **extra_fields):
        if not email and not phone_number:
            raise ValueError('The Email or Phone Number field must be set')
        if not first_name:
            raise ValueError('The First Name field must be set')
        if not last_name:
            raise ValueError('The Last Name field must be set')
        if not password:
            raise ValueError('The Password field must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', "SUPERUSER")

        return self.create_user(email, phone_number, first_name, last_name, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    ROLE_CHOICES = [
        ('SUPERUSER', 'Superuser'),
        ('SELLER', 'Seller'),
        ('END_USER', 'End User')
    ]
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    phone_number = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='END_USER')
    groups = models.ManyToManyField('auth.Group', related_name='custom_users_set', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups')
    user_permissions = models.ManyToManyField('auth.Permission', related_name='custom_users_set', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'first_name', 'last_name']

class Category(models.Model):
    name = models.CharField(max_length=100)
    image = models.BinaryField(null=True, blank=True)

class Product(models.Model):
    GENDER_CHOICES = [
        ("BOY", "Boy"),
        ("GIRL", "Girl"),
        ("UNISEX", "Unisex")
    ]
    name = models.CharField(max_length=50)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    images = models.JSONField(default=list)
    quantity = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name