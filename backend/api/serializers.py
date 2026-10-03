from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Client, 
    ServiceOrder, 
    ServiceOrderEquipment, 
    InspectionResponse, 
    ServiceOrderSignature,
    FinancialRecord, 
    InspectionCategory, 
    InspectionItem,
    InspectionPhoto,
    TeamMember,
    PlatformCompany,
    Equipment,
    InspectionTemplate
)

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_superuser', 'is_active')

class ClientSerializer(serializers.ModelSerializer):
    active_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_active_orders_count(self, obj):
        return obj.service_orders.exclude(status='concluida').count()

class InspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionPhoto
        fields = ['id', 'service_order', 'label', 'image', 'created_at']

class InspectionResponseSerializer(serializers.ModelSerializer):
    item_label = serializers.ReadOnlyField(source='item.label')
    category_title = serializers.ReadOnlyField(source='item.category.title')

    class Meta:
        model = InspectionResponse
        fields = ['id', 'item', 'item_label', 'category_title', 'status', 'value']


class ServiceOrderEquipmentSerializer(serializers.ModelSerializer):
    equipment_name = serializers.ReadOnlyField(source='equipment.name')
    equipment_location = serializers.ReadOnlyField(source='equipment.location')
    responses = InspectionResponseSerializer(many=True, required=False)

    class Meta:
        model = ServiceOrderEquipment
        fields = ['id', 'equipment', 'equipment_name', 'equipment_location', 'template', 'responses']


class ServiceOrderSignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderSignature
        fields = '__all__'


class ServiceOrderEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderEquipment
        fields = ['id', 'equipment', 'template']

class ServiceOrderSerializer(serializers.ModelSerializer):
    # Sobrescrevemos o campo para aceitar a lista de IDs de utilizadores sem travar no validation nativo
    technicians = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True
    )
    order_equipments = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = ServiceOrder
        fields = '__all__'

    def create(self, validated_data):
        technicians_ids = validated_data.pop('technicians', [])
        order_equipments_data = validated_data.pop('order_equipments', [])

        # 1. Cria a Ordem de Serviço principal
        service_order = ServiceOrder.objects.create(**validated_data)

        # 2. Associa os técnicos/utilizadores válidos
        if technicians_ids:
            # Pega o modelo real associado ao campo ManyToMany do ServiceOrder
            related_model = ServiceOrder._meta.get_field('technicians').related_model
            valid_techs = related_model.objects.filter(id__in=technicians_ids)
            service_order.technicians.set(valid_techs)

        # 3. Cria os relacionamentos de Equipamentos e Checklists
        for eq in order_equipments_data:
            if isinstance(eq, dict) and eq.get('equipment'):
                ServiceOrderEquipment.objects.create(
                    service_order=service_order,
                    equipment_id=eq.get('equipment'),
                    template_id=eq.get('template') if eq.get('template') else None
                )

        return service_order

class FinancialRecordSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')

    class Meta:
        model = FinancialRecord
        fields = '__all__'

class InspectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionItem
        fields = ['id', 'category', 'label', 'response_type', 'order']
        extra_kwargs = {'category': {'required': False}}

class InspectionCategorySerializer(serializers.ModelSerializer):
    items = InspectionItemSerializer(many=True, required=False)

    class Meta:
        model = InspectionCategory
        fields = ['id', 'template', 'title', 'order', 'items', 'created_at']
        extra_kwargs = {'template': {'required': False}}

class InspectionTemplateSerializer(serializers.ModelSerializer):
    categories = InspectionCategorySerializer(many=True, required=False)
    equipment_type_display = serializers.ReadOnlyField(source='get_equipment_type_display')

    class Meta:
        model = InspectionTemplate
        fields = ['id', 'name', 'equipment_type', 'equipment_type_display', 'categories', 'created_at']

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        template = InspectionTemplate.objects.create(**validated_data)

        for cat_data in categories_data:
            items_data = cat_data.pop('items', [])
            category = InspectionCategory.objects.create(template=template, **cat_data)
            for item_data in items_data:
                InspectionItem.objects.create(category=category, **item_data)

        return template

class TeamMemberSerializer(serializers.ModelSerializer):
    initials = serializers.ReadOnlyField()

    class Meta:
        model = TeamMember
        fields = [
            'id', 
            'company_name', 
            'name', 
            'email', 
            'role', 
            'status', 
            'initials', 
            'created_at'
        ]

class PlatformCompanySerializer(serializers.ModelSerializer):
    formatted_plan = serializers.SerializerMethodField()

    class Meta:
        model = PlatformCompany
        fields = '__all__'

    def get_formatted_plan(self, obj):
        return f"{obj.plan} · R$ {obj.monthly_fee:,.0f}/mês".replace(",", ".")

class EquipmentSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')

    class Meta:
        model = Equipment
        fields = '__all__'