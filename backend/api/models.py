from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        TECNICO = 'TECNICO', 'Técnico'
        CLIENTE = 'CLIENTE', 'Cliente'

    # Por padrão, qualquer cadastro comum entra como CLIENTE
    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.CLIENTE
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Client(models.Model):
    PLAN_CHOICES = [
        ('Essencial', 'Essencial'),
        ('Profissional', 'Profissional'),
        ('Empresarial', 'Empresarial'),
    ]

    STATUS_CHOICES = [
        ('ativo', 'Ativo'),
        ('renovacao', 'Renovação'),
        ('inativo', 'Inativo'),
    ]

    # Informações Básicas / Conta
    name = models.CharField(max_length=255)                  # Nome da empresa
    contract_code = models.CharField(max_length=100, blank=True, null=True) # Código do contrato
    access_email = models.EmailField(blank=True, null=True)   # E-mail de acesso
    initial_password = models.CharField(max_length=255, blank=True, null=True) # Senha inicial
    plan = models.CharField(max_length=50, choices=PLAN_CHOICES, default='Essencial')
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Valor mensal (R$)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')

    # Dados Completos do Cliente
    cnpj = models.CharField(max_length=20, blank=True, null=True)
    trade_name = models.CharField(max_length=255, blank=True, null=True) # Nome fantasia
    cep = models.CharField(max_length=15, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)       # Estado
    address = models.CharField(max_length=255, blank=True, null=True)     # Endereço
    number = models.CharField(max_length=20, blank=True, null=True)       # Número
    complement = models.CharField(max_length=100, blank=True, null=True) # Complemento
    neighborhood = models.CharField(max_length=100, blank=True, null=True) # Bairro
    city = models.CharField(max_length=100, blank=True, null=True)       # Cidade
    phone = models.CharField(max_length=30, blank=True, null=True)       # Telefone

    # Responsável
    contact_person = models.CharField(max_length=255, blank=True, null=True) # Responsável no cliente
    contact_email = models.EmailField(blank=True, null=True)                # E-mail do responsável

    # Logótipo
    logo = models.ImageField(upload_to='client_logos/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceOrder(models.Model):
    STATUS_CHOICES = [
        ('em_campo', 'Em Campo'),
        ('aberta', 'Aguardando Despacho'),
        ('concluida', 'Concluída'),
    ]

    title = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='service_orders')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='aberta')
    technicians_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.client.name}"


class FinancialRecord(models.Model):
    STATUS_CHOICES = [
        ('pago', 'Pago'),
        ('pendente', 'Pendente'),
        ('atrasado', 'Atrasado'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='financial_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - R$ {self.amount} ({self.status})"

class InspectionCategory(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class InspectionItem(models.Model):
    category = models.ForeignKey(InspectionCategory, related_name='items', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category.name} - {self.title}"

class InspectionPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service_order = models.ForeignKey(
        ServiceOrder, 
        on_delete=models.CASCADE, 
        related_name='photos',
        null=True, blank=True
    )
    label = models.CharField(max_length=100)
    image = models.ImageField(upload_to='inspection_photos/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.label} - {self.id}"

class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('Administrador', 'Administrador'),
        ('Técnico de campo', 'Técnico de campo'),
        ('Supervisor', 'Supervisor'),
    ]

    company_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Técnico de campo')
    status = models.CharField(max_length=50, default='online')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or self.email} - {self.role}"

    @property
    def initials(self):
        # Gera iniciais a partir do nome ou email
        display_name = self.name if self.name else self.email.split('@')[0]
        parts = display_name.strip().split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}".upper()
        return display_name[:2].upper()

class PlatformCompany(models.Model):
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('trial', 'Trial'),
        ('inativa', 'Inativa'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nome da Empresa")
    plan = models.CharField(max_length=100, default="Profissional")
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=1890.00)
    users_count = models.IntegerField(default=1, verbose_name="Número de Usuários")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativa')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name