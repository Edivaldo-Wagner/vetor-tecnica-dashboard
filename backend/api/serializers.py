from rest_framework import serializers
from .models import (
    Client, 
    ServiceOrder, 
    FinancialRecord, 
    InspectionCategory, 
    InspectionItem,
    InspectionPhoto,
    TeamMember,
    PlatformCompany
)

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

class ServiceOrderSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    photos = InspectionPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceOrder
        fields = '__all__'

class FinancialRecordSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')

    class Meta:
        model = FinancialRecord
        fields = '__all__'

class InspectionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionItem
        fields = ['id', 'title', 'is_completed']

class InspectionCategorySerializer(serializers.ModelSerializer):
    items = InspectionItemSerializer(many=True, read_only=True)
    items_text = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = InspectionCategory
        fields = ['id', 'name', 'items', 'items_text', 'created_at']

    def create(self, validated_data):
        items_text = validated_data.pop('items_text', '')
        category = InspectionCategory.objects.create(**validated_data)

        if items_text:
            lines = [line.strip() for line in items_text.split('\n') if line.strip()]
            for line in lines:
                InspectionItem.objects.create(category=category, title=line)

        return category

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