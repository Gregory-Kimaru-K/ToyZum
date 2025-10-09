from django.contrib import admin
from .models import Industry, Product, CustomUser, Category, Adverts
# Register your models here.
admin.site.register(Industry)
admin.site.register(Product)
admin.site.register(CustomUser)
admin.site.register(Category)
admin.site.register(Adverts)