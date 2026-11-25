from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q


class CustomUserBackend(ModelBackend):
    def authenticate(self, request, email=None, phone_number=None, password=None, **kwargs):
        identifier = email or phone_number
        if not identifier or password is None:
            return None
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(Q(email=identifier) | Q(phone_number=identifier))
        except UserModel.DoesNotExist:
            # Match Django's missing-user password work rather than returning early.
            UserModel().set_password(password)
            return None
        except UserModel.MultipleObjectsReturned:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
