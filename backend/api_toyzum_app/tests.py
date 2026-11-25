from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()
PASSWORD = 'UnusualBoardgame!428'


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class AuthenticationTests(APITestCase):
    def registration(self, **overrides):
        data = {
            'email': 'player@example.com', 'phone_number': '254700000100',
            'first_name': 'Test', 'last_name': 'Player', 'password': PASSWORD,
        }
        data.update(overrides)
        return data

    def create_user(self, **overrides):
        return User.objects.create_user(**self.registration(**overrides))

    def login(self, identifier, password=PASSWORD):
        return self.client.post(reverse('token_obtain_pair'), {'email': identifier, 'password': password}, format='json')

    def authenticate_user(self, user):
        response = self.login(user.email or user.phone_number)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        return response.data

    def assert_profile_claims(self, access, user):
        claims = AccessToken(access)
        for field in ('email', 'phone_number', 'first_name', 'last_name', 'role'):
            self.assertEqual(claims[field], getattr(user, field))

    def test_signup_returns_customer_tokens_with_login_profile_claims(self):
        response = self.client.post(reverse('custom_user_create'), self.registration(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='player@example.com')
        self.assertTrue(user.check_password(PASSWORD))
        self.assertEqual(user.role, 'END_USER')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assert_profile_claims(response.data['access'], user)
        login = self.login(user.email)
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assert_profile_claims(login.data['access'], user)

    def test_public_signup_cannot_assign_privileged_roles_or_flags(self):
        for index, role in enumerate(('SELLER', 'SUPERUSER')):
            with self.subTest(role=role):
                payload = self.registration(email=f'player{index}@example.com', phone_number=f'25470000010{index}', role=role, is_staff=True, is_superuser=True)
                response = self.client.post(reverse('custom_user_create'), payload, format='json')
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
                user = User.objects.get(email=payload['email'])
                self.assertEqual(user.role, 'END_USER')
                self.assertFalse(user.is_staff)
                self.assertFalse(user.is_superuser)
                self.assertEqual(AccessToken(response.data['access'])['role'], 'END_USER')

    def test_signup_uses_configured_password_validators(self):
        for password in ('abc', 'password', '123456789'):
            with self.subTest(password=password):
                response = self.client.post(reverse('custom_user_create'), self.registration(password=password), format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('password', response.data)
        self.assertEqual(User.objects.count(), 0)

    def test_duplicate_signup_is_validation_error(self):
        self.create_user()
        response = self.client.post(reverse('custom_user_create'), self.registration(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)

    def test_login_accepts_email_and_phone(self):
        user = self.create_user()
        for identifier in (user.email, user.phone_number):
            with self.subTest(identifier=identifier):
                response = self.login(identifier)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assert_profile_claims(response.data['access'], user)

    def test_phone_only_account_can_login_without_matching_null_email_accounts(self):
        user = self.create_user(email=None)
        response = self.login(user.phone_number)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_profile_claims(response.data['access'], user)

    def test_invalid_and_inactive_logins_are_rejected(self):
        user = self.create_user()
        response = self.login(user.email, 'WrongPassword!428')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        user.is_active = False
        user.save()
        self.assertEqual(self.login(user.email).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.login(user.phone_number).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_preserves_profile_and_rotates_refresh_token(self):
        user = self.create_user()
        tokens = self.login(user.email).data
        response = self.client.post(reverse('token_refresh'), {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_profile_claims(response.data['access'], user)
        self.assertNotEqual(response.data['refresh'], tokens['refresh'])
        reused = self.client.post(reverse('token_refresh'), {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(reused.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_account_update_requires_authentication(self):
        user = self.create_user()
        response = self.client.put(reverse('custom_user_update', args=[user.email]), {'first_name': 'Changed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Test')

    def test_profile_edit_preserves_password_hash_and_does_not_return_password(self):
        user = self.create_user()
        original_hash = user.password
        self.authenticate_user(user)
        response = self.client.put(reverse('custom_user_update', args=[user.email]), {'first_name': 'Updated'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('password', response.data)
        user.refresh_from_db()
        self.assertEqual(user.password, original_hash)
        self.assertEqual(user.first_name, 'Updated')
        self.assertEqual(self.login(user.email).status_code, status.HTTP_200_OK)

    def test_account_update_cannot_promote_customer(self):
        user = self.create_user()
        self.authenticate_user(user)
        response = self.client.put(reverse('custom_user_update', args=[user.email]), {'role': 'SUPERUSER', 'is_staff': True, 'is_superuser': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.role, 'END_USER')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_customer_and_store_staff_cannot_edit_another_account(self):
        target = self.create_user(email='other@example.com', phone_number='254700000200')
        for role in ('END_USER', 'SELLER', 'SUPERUSER'):
            with self.subTest(role=role):
                actor = self.create_user(email=f'{role}@example.com', phone_number=f'2547000003{len(role):02}', role=role)
                self.authenticate_user(actor)
                response = self.client.put(reverse('custom_user_update', args=[target.email]), {'first_name': 'Changed'}, format='json')
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        target.refresh_from_db()
        self.assertEqual(target.first_name, 'Test')

    def test_actual_superuser_can_edit_another_profile(self):
        target = self.create_user()
        admin = User.objects.create_superuser(**self.registration(email='admin@example.com', phone_number='254700000400'))
        self.authenticate_user(admin)
        response = self.client.put(reverse('custom_user_update', args=[target.email]), {'first_name': 'Updated'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        target.refresh_from_db()
        self.assertEqual(target.first_name, 'Updated')

    def test_explicit_password_change_is_hashed_and_validated(self):
        user = self.create_user()
        self.authenticate_user(user)
        path = reverse('custom_user_update', args=[user.email])
        weak = self.client.put(path, {'password': 'abc'}, format='json')
        self.assertEqual(weak.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertTrue(user.check_password(PASSWORD))
        response = self.client.put(path, {'password': 'DifferentGame!937'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertFalse(user.check_password(PASSWORD))
        self.assertTrue(user.check_password('DifferentGame!937'))


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class DepartmentTests(APITestCase):
    def setUp(self):
        self.path = reverse('create_industry')
        self.admin = User.objects.create_superuser(
            email='departments@example.com', phone_number='254700001001',
            first_name='Store', last_name='Admin', password=PASSWORD,
        )

    def test_department_creation_requires_authentication(self):
        response = self.client.post(self.path, {'name': 'Adult games'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_role_label_alone_cannot_grant_department_management(self):
        for index, role in enumerate(('END_USER', 'SELLER', 'SUPERUSER')):
            with self.subTest(role=role):
                user = User.objects.create_user(
                    email=f'department{index}@example.com', phone_number=f'25470000200{index}',
                    first_name='Test', last_name='User', password=PASSWORD, role=role,
                )
                self.client.force_authenticate(user)
                response = self.client.post(self.path, {'name': 'Adult games'}, format='json')
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_department_with_generated_slug_and_optional_image(self):
        from .models import Industry
        self.client.force_authenticate(self.admin)
        response = self.client.post(self.path, {'name': '  Adult games  ', 'image': 'data:image/png;base64,test', 'slug': 'untrusted-slug'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        department = Industry.objects.get(pk=response.data['id'])
        self.assertEqual(department.name, 'Adult games')
        self.assertEqual(department.slug, 'adult-games')
        self.assertEqual(department.image, 'data:image/png;base64,test')

    def test_department_name_is_required_and_unique(self):
        self.client.force_authenticate(self.admin)
        for payload in ({}, {'name': '   '}, {'name': 'x' * 101}):
            with self.subTest(payload=payload):
                response = self.client.post(self.path, payload, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('name', response.data)
        self.assertEqual(self.client.post(self.path, {'name': 'Kids'}, format='json').status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post(self.path, {'name': 'Kids'}, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

    def test_created_department_is_listed_and_can_be_used_for_category_creation(self):
        from .models import Category
        self.client.force_authenticate(self.admin)
        department = self.client.post(self.path, {'name': 'Games & toys'}, format='json')
        self.assertEqual(department.status_code, status.HTTP_201_CREATED)
        category = self.client.post(reverse('create_category'), {'name': 'Couples games', 'industry': department.data['id']}, format='json')
        self.assertEqual(category.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.get(pk=category.data['id']).industry_id, department.data['id'])
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/toyzum/graphql/', {'query': '{ allIndustries { id name slug } }'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertNotIn('errors', payload)
        self.assertIn(str(department.data['id']), [item['id'] for item in payload['data']['allIndustries']])


@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class ProductCategoryTests(APITestCase):
    def setUp(self):
        from .models import Industry, Category
        self.admin = User.objects.create_superuser(email='catalogue@example.com', phone_number='254700003001', first_name='Store', last_name='Admin', password=PASSWORD)
        department = Industry.objects.create(name='Games')
        self.first = Category.objects.create(name='Couples', industry=department)
        self.second = Category.objects.create(name='Party', industry=department)
        self.client.force_authenticate(self.admin)
        self.payload = {'name': 'Together', 'description': 'A game for two or more', 'price': '1000.00', 'quantity': 10, 'gender': 'UNISEX', 'images': []}

    def test_product_creation_accepts_multiple_categories_and_preserves_primary(self):
        from .models import Product
        response = self.client.post(reverse('product_view_create'), {**self.payload, 'categories': [self.first.pk, self.second.pk]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(pk=response.data['id'])
        self.assertEqual(set(product.categories.values_list('id', flat=True)), {self.first.pk, self.second.pk})
        self.assertEqual(product.category_id, self.first.pk)
        self.assertEqual({item['name'] for item in response.data['category_details']}, {'Couples', 'Party'})

    def test_legacy_single_category_input_still_populates_categories(self):
        from .models import Product
        response = self.client.post(reverse('product_view_create'), {**self.payload, 'category': self.second.pk}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(pk=response.data['id'])
        self.assertEqual(list(product.categories.values_list('id', flat=True)), [self.second.pk])

    def test_graphql_category_filter_has_no_duplicate_products(self):
        from .models import Product
        product = Product.objects.create(**self.payload, seller=self.admin)
        product.categories.set([self.first, self.second])
        self.client.force_authenticate(user=None)
        query = '{ allProducts(categories_Slug_In: ["couples", "party"]) { edges { node { name categories { name } } } } }'
        response = self.client.post('/api/toyzum/graphql/', {'query': query}, format='json')
        payload = response.json()
        self.assertNotIn('errors', payload)
        nodes = [edge['node'] for edge in payload['data']['allProducts']['edges']]
        self.assertEqual(len(nodes), 1)
        self.assertEqual({item['name'] for item in nodes[0]['categories']}, {'Couples', 'Party'})

    def test_category_updates_do_not_clear_other_assignments_for_legacy_clients(self):
        from .models import Product
        from .serializers import ProductSerializer
        product = Product.objects.create(**self.payload, seller=self.admin, category=self.first)
        product.categories.set([self.first, self.second])
        serializer = ProductSerializer(product, data={'category': self.second.pk}, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assertEqual(product.categories.count(), 2)

    def test_unknown_category_is_rejected_without_creating_product(self):
        from .models import Product
        response = self.client.post(reverse('product_view_create'), {**self.payload, 'categories': [999999]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Product.objects.count(), 0)
