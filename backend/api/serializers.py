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
    template_name = serializers.ReadOnlyField(source='template.name')
    categories = serializers.SerializerMethodField()

    class Meta:
        model = ServiceOrderEquipment
        fields = ['id', 'equipment', 'equipment_name', 'equipment_location', 'template', 'template_name', 'categories']

    def get_categories(self, obj):
        if not obj.template:
            return []
        
        # Mapeia as respostas já salvas para consulta rápida por item_id
        responses_map = {
            resp.item_id: resp for resp in obj.responses.all()
        }

        categories_data = []
        for cat in obj.template.categories.all():
            items_list = []
            for item in cat.items.all():
                resp = responses_map.get(item.id)
                items_list.append({
                    "id": item.id,
                    "label": item.label,
                    "status": resp.status if resp else (item.status or "SIM"),
                    "observation": resp.value if resp else (item.observation or "")
                })
            
            categories_data.append({
                "id": cat.id,
                "title": cat.title,
                "items": items_list
            })
        
        return categories_data

class ServiceOrderSignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrderSignature
        fields = '__all__'

class ServiceOrderSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    technicians_details = serializers.SerializerMethodField()
    
    # Aponta para o User em vez de TeamMember
    technicians = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )
    
    order_equipments = ServiceOrderEquipmentSerializer(many=True, read_only=True)
    order_equipments_input = serializers.JSONField(required=False, write_only=True)

    class Meta:
        model = ServiceOrder
        fields = '__all__'

    def get_technicians_details(self, obj):
        return [
            {
                "id": tech.id, 
                "name": f"{tech.first_name} {tech.last_name}".strip() or tech.username
            } 
            for tech in obj.technicians.all()
        ]

    def create(self, validated_data):
        technicians_list = validated_data.pop('technicians', [])
        order_equipments_data = validated_data.pop('order_equipments_input', None)
        if not order_equipments_data:
            order_equipments_data = validated_data.pop('order_equipments', [])

        service_order = ServiceOrder.objects.create(**validated_data)

        if technicians_list:
            service_order.technicians.set(technicians_list)

        for eq in order_equipments_data:
            if isinstance(eq, dict):
                equipment_id = eq.get('equipment')
                template_id = eq.get('template')
                
                if equipment_id:
                    ServiceOrderEquipment.objects.create(
                        service_order=service_order,
                        equipment_id=equipment_id,
                        template_id=template_id if template_id else None
                    )

        return service_order

    def update(self, instance, validated_data):
        technicians_list = validated_data.pop('technicians', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if technicians_list is not None:
            instance.technicians.set(technicians_list)

        return instance

class FinancialRecordSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')

    class Meta:
        model = FinancialRecord
        fields = '__all__'

class InspectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionItem
        fields = ['id', 'category', 'label', 'status', 'observation', 'order']
        extra_kwargs = {'category': {'required': False}}

class InspectionCategorySerializer(serializers.ModelSerializer):
    items = InspectionItemSerializer(many=True, required=False)

    class Meta:
        model = InspectionCategory
        fields = ['id', 'template', 'title', 'order', 'items', 'created_at']
        extra_kwargs = {'template': {'required': False}}

class InspectionTemplateSerializer(serializers.ModelSerializer):
    categories = InspectionCategorySerializer(many=True, required=False)
    equipment_name = serializers.ReadOnlyField(source='equipment.name')
    
    # Aceita uma string simples para o campo equipment_type (sem restrição de choices)
    equipment_type = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    
    # Permite passar 'equipment' (ID do equipamento) de forma opcional
    equipment = serializers.PrimaryKeyRelatedField(
        queryset=Equipment.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = InspectionTemplate
        fields = [
            'id', 
            'name', 
            'equipment', 
            'equipment_name', 
            'equipment_type', 
            'categories', 
            'created_at'
        ]

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