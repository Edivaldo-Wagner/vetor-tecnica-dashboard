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
        ('aberta', 'Aguardando Despacho'),
        ('em_campo', 'Em Campo'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]

    os_number = models.CharField(max_length=50, unique=True, verbose_name="Número da O.S.")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='service_orders')
    
    # Agendamento e Execução
    execution_start = models.DateTimeField(null=True, blank=True, verbose_name="Início Previsto")
    execution_end = models.DateTimeField(null=True, blank=True, verbose_name="Fim Previsto")
    check_in = models.DateTimeField(null=True, blank=True, verbose_name="Check-in Real")
    check_out = models.DateTimeField(null=True, blank=True, verbose_name="Check-out Real")
    
    # Equipa de Técnicos Responsáveis
    technicians = models.ManyToManyField('TeamMember', blank=True, related_name='service_orders')
    
    # Detalhes do Trabalho
    scope = models.TextField(blank=True, null=True, verbose_name="Escopo do Trabalho")
    complementary_services = models.TextField(blank=True, null=True, verbose_name="Serviços Complementares")
    conclusions = models.TextField(blank=True, null=True, verbose_name="Conclusões / Observações Técnicas")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberta')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"O.S. #{self.os_number} - {self.client.name}"


class ServiceOrderEquipment(models.Model):
    """
    Relaciona um Equipamento/Sistema específico a uma O.S., 
    vinculando qual Modelo de Checklist foi usado para inspecioná-lo.
    """
    service_order = models.ForeignKey('ServiceOrder', on_delete=models.CASCADE, related_name='order_equipments')
    equipment = models.ForeignKey('Equipment', on_delete=models.CASCADE, related_name='order_inspections')
    template = models.ForeignKey('InspectionTemplate', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"O.S. #{self.service_order.os_number} -> {self.equipment.name}"


class InspectionResponse(models.Model):
    """
    Armazena a resposta individual para cada item do checklist de um equipamento na O.S.
    """
    STATUS_CHOICES = [
        ('SIM', 'Sim / Conforme'),
        ('NAO', 'Não / Não Conforme'),
        ('NA', 'N/A (Não Aplicável)'),
    ]

    order_equipment = models.ForeignKey('ServiceOrderEquipment', on_delete=models.CASCADE, related_name='responses')
    item = models.ForeignKey('InspectionItem', on_delete=models.CASCADE)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SIM')
    value = models.CharField(max_length=255, blank=True, null=True, verbose_name="Valor Medido / Observação")

    def __str__(self):
        return f"{self.item.label}: {self.status} ({self.value or ''})"


class ServiceOrderSignature(models.Model):
    """
    Assinaturas digitais recolhidas no encerramento da O.S.
    """
    service_order = models.OneToOneField('ServiceOrder', on_delete=models.CASCADE, related_name='signature')
    client_name = models.CharField(max_length=255, verbose_name="Nome do Responsável do Cliente")
    client_signature = models.ImageField(upload_to='signatures/client/', blank=True, null=True)
    technician_name = models.CharField(max_length=255, verbose_name="Nome do Técnico")
    technician_signature = models.ImageField(upload_to='signatures/tech/', blank=True, null=True)
    signed_at = models.DateTimeField(auto_now_add=True)


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

class InspectionTemplate(models.Model):
    """
    Guarda o Modelo Geral de Checklist (Ex: 'SDAI - Sistema de Alarme GST', 'Casa de Bombas')
    """
    EQUIPMENT_TYPES = [
        ('SDAI', 'Sistema de Detecção e Alarme de Incêndio'),
        ('BOMBAS', 'Casa de Bombas / Motobombas'),
        ('SPRINKLERS', 'Rede de Chuveiros Automáticos (Sprinklers)'),
        ('ILUMINACAO', 'Iluminação de Emergência'),
        ('EXTINTORES', 'Extintores de Incêndio'),
        ('OUTRO', 'Outro Sistema'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nome do Modelo")
    equipment_type = models.CharField(max_length=50, choices=EQUIPMENT_TYPES, default='SDAI', verbose_name="Tipo de Equipamento")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_equipment_type_display()})"

class InspectionCategory(models.Model):
    """
    Blocos/Categorias dentro do Modelo (Ex: '01 - DETECTORES', '05 - CENTRAL DE ALARME')
    """
    template = models.ForeignKey(InspectionTemplate, related_name='categories', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, verbose_name="Título da Categoria / Bloco")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem de Exibição")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.template.name} -> {self.title}"


class InspectionItem(models.Model):
    """
    A Pergunta ou Verificação Técnica Individual
    """
    RESPONSE_TYPES = [
        ('BOOLEAN', 'Sim / Não / N/A (Conforme / Não Conforme)'),
        ('NUMBER', 'Número / Medição (Volts, PSI, Horímetro)'),
        ('TEXT', 'Texto Livre / Observação'),
    ]

    category = models.ForeignKey(InspectionCategory, related_name='items', on_delete=models.CASCADE)
    label = models.CharField(max_length=255, verbose_name="Pergunta / Item de Inspeção")
    response_type = models.CharField(max_length=20, choices=RESPONSE_TYPES, default='BOOLEAN')
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.category.title} -> {self.label}"

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

class Equipment(models.Model):
    SYSTEM_TYPES = [
        ('SDAI', 'Sistema de Detecção e Alarme de Incêndio'),
        ('BOMBAS', 'Casa de Bombas / Motobombas'),
        ('SPRINKLERS', 'Rede de Chuveiros Automáticos (Sprinklers)'),
        ('ILUMINACAO', 'Iluminação de Emergência'),
        ('EXTINTORES', 'Extintores de Incêndio'),
        ('OUTRO', 'Outro Sistema'),
    ]

    client = models.ForeignKey(
        'Client', 
        on_delete=models.CASCADE, 
        related_name='equipments',
        verbose_name="Cliente"
    )
    name = models.CharField(max_length=255, verbose_name="Nome do Sistema / Equipamento")
    system_type = models.CharField(max_length=20, choices=SYSTEM_TYPES, default='SDAI')
    model = models.CharField(max_length=100, blank=True, null=True, verbose_name="Modelo / Marca")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="Localização na Planta")
    serial_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Nº de Série")
    notes = models.TextField(blank=True, null=True, verbose_name="Observações Técnicas")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.client.name}"